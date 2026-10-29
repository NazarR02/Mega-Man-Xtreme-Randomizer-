const BPS_MAGIC = "BPS1";

let crcTable;

export function inspectBpsPatch(patchBytes) {
  const patch = asUint8Array(patchBytes);
  if (patch.length < 19 || readAscii(patch, 0, 4) !== BPS_MAGIC) {
    throw new Error("The base file is not a valid BPS patch.");
  }

  const cursor = { offset: 4 };
  const sourceSize = readBpsNumber(patch, cursor);
  const targetSize = readBpsNumber(patch, cursor);
  const metadataSize = readBpsNumber(patch, cursor);
  const metadataEnd = cursor.offset + metadataSize;
  if (metadataEnd > patch.length - 12) {
    throw new Error("The BPS patch metadata is corrupted.");
  }

  cursor.offset = metadataEnd;
  const footerOffset = patch.length - 12;
  const sourceCrc = readUint32Le(patch, footerOffset);
  const targetCrc = readUint32Le(patch, footerOffset + 4);
  const patchCrc = readUint32Le(patch, footerOffset + 8);
  const computedPatchCrc = crc32(patch.subarray(0, patch.length - 4));

  if (computedPatchCrc !== patchCrc) {
    throw new Error(
      `The BPS patch is corrupted. Expected CRC ${formatCrc(patchCrc)}, got ${formatCrc(computedPatchCrc)}.`,
    );
  }

  return {
    sourceSize,
    targetSize,
    sourceCrc,
    targetCrc,
    patchCrc,
    actionsOffset: cursor.offset,
    footerOffset,
  };
}

export function applyBpsPatch(sourceBytes, patchBytes) {
  const source = asUint8Array(sourceBytes);
  const patch = asUint8Array(patchBytes);
  const info = inspectBpsPatch(patch);

  if (source.length !== info.sourceSize) {
    throw new Error(`The source file must be ${info.sourceSize} bytes; it is ${source.length}.`);
  }

  const sourceCrc = crc32(source);
  if (sourceCrc !== info.sourceCrc) {
    throw new Error(
      `Incompatible file version. Expected CRC ${formatCrc(info.sourceCrc)}, got ${formatCrc(sourceCrc)}.`,
    );
  }

  const output = new Uint8Array(info.targetSize);
  const cursor = { offset: info.actionsOffset };
  let outputOffset = 0;
  let sourceRelativeOffset = 0;
  let targetRelativeOffset = 0;

  while (cursor.offset < info.footerOffset) {
    const action = readBpsNumber(patch, cursor);
    const mode = action & 0x03;
    const length = (action >>> 2) + 1;

    if (outputOffset + length > output.length) {
      throw new Error("The BPS patch is trying to write outside the target file.");
    }

    if (mode === 0) {
      ensureRange(source, outputOffset, length, "SourceRead");
      output.set(source.subarray(outputOffset, outputOffset + length), outputOffset);
    } else if (mode === 1) {
      ensureRange(patch, cursor.offset, length, "TargetRead");
      output.set(patch.subarray(cursor.offset, cursor.offset + length), outputOffset);
      cursor.offset += length;
    } else if (mode === 2) {
      sourceRelativeOffset += readBpsSignedNumber(patch, cursor);
      ensureRange(source, sourceRelativeOffset, length, "SourceCopy");
      output.set(source.subarray(sourceRelativeOffset, sourceRelativeOffset + length), outputOffset);
      sourceRelativeOffset += length;
    } else {
      targetRelativeOffset += readBpsSignedNumber(patch, cursor);
      ensureRange(output, targetRelativeOffset, length, "TargetCopy");
      for (let index = 0; index < length; index += 1) {
        output[outputOffset + index] = output[targetRelativeOffset + index];
      }
      targetRelativeOffset += length;
    }

    outputOffset += length;
  }

  if (outputOffset !== info.targetSize) {
    throw new Error(`The BPS patch generated ${outputOffset} bytes; expected ${info.targetSize}.`);
  }

  const targetCrc = crc32(output);
  if (targetCrc !== info.targetCrc) {
    throw new Error(
      `The prepared file does not match the patch. Expected CRC ${formatCrc(info.targetCrc)}, got ${formatCrc(targetCrc)}.`,
    );
  }

  return output;
}

export function createBpsPatch(sourceBytes, targetBytes) {
  const source = asUint8Array(sourceBytes);
  const target = asUint8Array(targetBytes);
  // Expanded MBC5 output mirrors banks 01..3F after the new bank 40.
  // Encode that tail as TargetCopy instead of embedding a second ROM copy.
  let mirrorStart = target.length;
  if (source.length === 0x100000 && target.length === 0x200000) {
    const start = 0x104000;
    let identical = true;
    for (let i = start; i < target.length; i++) {
      if (target[i] !== target[i - 0x100000]) { identical = false; break; }
    }
    if (identical) mirrorStart = start;
  }
  const patch = [
    ...asciiBytes(BPS_MAGIC),
    ...writeBpsNumber(source.length),
    ...writeBpsNumber(target.length),
    ...writeBpsNumber(0),
  ];

  let offset = 0;
  while (offset < target.length) {
    if (offset === mirrorStart) {
      patch.push(...writeBpsNumber(((target.length - offset - 1) << 2) | 3));
      patch.push(...writeBpsNumber(0x4000 << 1)); // first TargetCopy: relative to 0
      break;
    }
    const canReadSource = offset < source.length && source[offset] === target[offset];
    let length = 1;

    if (canReadSource) {
      while (offset + length < target.length && offset + length < source.length && source[offset + length] === target[offset + length]) {
        length += 1;
      }
      patch.push(...writeBpsNumber(((length - 1) << 2) | 0));
    } else {
      while (
        offset + length < mirrorStart &&
        !(offset + length < source.length && source[offset + length] === target[offset + length])
      ) {
        length += 1;
      }
      patch.push(...writeBpsNumber(((length - 1) << 2) | 1));
      for (let index = 0; index < length; index += 1) patch.push(target[offset + index]);
    }

    offset += length;
  }

  patch.push(...writeUint32Le(crc32(source)));
  patch.push(...writeUint32Le(crc32(target)));

  const patchWithoutPatchCrc = Uint8Array.from(patch);
  patch.push(...writeUint32Le(crc32(patchWithoutPatchCrc)));
  return Uint8Array.from(patch);
}

export function crc32(bytes) {
  const data = asUint8Array(bytes);
  const table = getCrcTable();
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function formatCrc(value) {
  return (value >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

function readBpsNumber(bytes, cursor) {
  let data = 0;
  let shift = 1;

  while (true) {
    if (cursor.offset >= bytes.length) throw new Error("Numero BPS incompleto.");
    const value = bytes[cursor.offset++];
    data += (value & 0x7f) * shift;
    if (value & 0x80) return data;
    shift <<= 7;
    data += shift;
  }
}

function writeBpsNumber(value) {
  let data = Number(value);
  if (!Number.isInteger(data) || data < 0) throw new Error("Invalid BPS number.");
  const bytes = [];

  while (true) {
    const byte = data & 0x7f;
    data >>>= 7;
    if (data === 0) {
      bytes.push(byte | 0x80);
      break;
    }
    bytes.push(byte);
    data -= 1;
  }

  return bytes;
}

function readBpsSignedNumber(bytes, cursor) {
  const value = readBpsNumber(bytes, cursor);
  const magnitude = value >>> 1;
  return value & 1 ? -magnitude : magnitude;
}

function writeUint32Le(value) {
  const data = value >>> 0;
  return [data & 0xff, (data >>> 8) & 0xff, (data >>> 16) & 0xff, (data >>> 24) & 0xff];
}

function readUint32Le(bytes, offset) {
  ensureRange(bytes, offset, 4, "CRC");
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function readAscii(bytes, offset, length) {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function asciiBytes(value) {
  return [...value].map((char) => char.charCodeAt(0) & 0xff);
}

function ensureRange(bytes, offset, length, operation) {
  if (offset < 0 || offset + length > bytes.length) {
    throw new Error(`${operation} out of range at 0x${Math.max(0, offset).toString(16).toUpperCase()}.`);
  }
}

function asUint8Array(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  throw new TypeError("Se esperaba un Uint8Array o ArrayBuffer.");
}

function getCrcTable() {
  if (crcTable) return crcTable;

  crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    crcTable[index] = value >>> 0;
  }
  return crcTable;
}
