import { createDomeWeapon, patchDomeWeakness } from './dome-weakness.js?v=1';
import { patchBossRewardText } from './boss-reward-text.js?v=1';
import { applyBpsPatch, crc32, formatCrc, inspectBpsPatch } from "./bps.js?v=release-1.2.1";
import { hasKeyMenu, refreshKeyMenu, configureItemTexts, hasItemTexts } from './key-menu.js?v=release-1.2.1';
import { createBossWeaknesses, patchBossWeaknesses } from './boss-weakness.js?v=3';
import {
  ARMOR_PARTS,
  BANK_SIZE,
  BOSS_WEAPONS,
  BOSS_KEY_VALUES,
  PALETTE_BANK,
  PALETTE_SIZE,
  PALETTE_START_ADDRESS,
  POINTER_TABLE_ADDRESS,
  POINTER_TABLE_SIZE,
  REWARD_TYPES,
  REWARD_BANK,
  REWARD_DATA_ADDRESS,
  ROM_SEED_METADATA_ADDRESS,
  ROM_SEED_METADATA_BANK,
  ROM_SEED_METADATA_SIZE,
  SIGMA_KEYS,
  STARTING_TABLE_ADDRESS,
  STARTING_TABLE_BANK,
  STARTING_TABLE_MAX_ENTRIES,
  STARTING_TABLE_SIZE,
  ZERO_SKILLS,
  WEAPON_PALETTES,
  isValidBossKeyValue,
} from "./tables.js?v=full-progression-1";

const BASE_PATCH_URL = new URL("../randomizer patch v1.2.bps?v=release-1.2.1", import.meta.url);
const ITEM_TEXT_PATCH_URL = new URL("../randomizer patch v1.2 - item texts.bps?v=release-1.2.1", import.meta.url);
const BASE_PATCH_VERSION = "randomizer patch v1.2 + key menu";
const ROM_SEED_METADATA_SIGNATURE = Object.freeze([0x4d, 0x58, 0x54, 0x53]); // MXTS
const ROM_SEED_METADATA_VERSION = 1;
const GLOBAL_CHECKSUM_HIGH_OFFSET = 0x014e;
const GLOBAL_CHECKSUM_LOW_OFFSET = 0x014f;
const STARTING_MODE_CODES = Object.freeze({ none: 0, normal: 1, generous: 2, custom: 3 });
const STARTING_MODE_NAMES = Object.freeze(["none", "normal", "generous", "custom"]);
const BASE_PATCH_SIGNATURES = Object.freeze([
  { offset: 0x057c8f, bytes: [0xfa, 0x5f, 0xd3, 0x4f, 0x06, 0x00, 0x21, 0xe4, 0xd3, 0x09, 0x7e, 0xa7] },
  { offset: 0x07beaa, bytes: [0xf6, 0x80, 0xea, 0x83, 0xd3, 0x18, 0x22, 0x00, 0xfa, 0x83, 0xd3, 0xf6, 0x20] },
  { offset: 0x0ffb17, bytes: [0xc5, 0xe5, 0xfa, 0xe0, 0xd3, 0x00, 0xfe, 0x01, 0x28, 0x25] },
]);
let basePatchPromise;
let itemTextPatchPromise;

export async function readRomFile(file) {
  if (!file) throw new Error("Select a game file first.");
  return new Uint8Array(await file.arrayBuffer());
}

export async function prepareRom(sourceRom, { showItemTexts = false } = {}) {
  if (!(sourceRom instanceof Uint8Array)) throw new Error("The selected file could not be read.");

  const patch = await loadBasePatch(showItemTexts);
  const patchInfo = inspectBpsPatch(patch);
  const inputCrc = crc32(sourceRom);
  const signaturesPresent = hasBasePatchSignatures(sourceRom);

  if (sourceRom.length === patchInfo.targetSize && inputCrc === patchInfo.targetCrc) {
    return preparationResult(sourceRom, patchInfo, inputCrc, "already-patched", false);
  }

  if (sourceRom.length === patchInfo.targetSize && signaturesPresent && hasKeyMenu(sourceRom)) {
    const configured = new Uint8Array(sourceRom);
    const changed = hasItemTexts(configured) !== Boolean(showItemTexts);
    configureItemTexts(configured,Boolean(showItemTexts));
    refreshKeyMenu(configured);
    fixGlobalChecksum(configured);
    return preparationResult(configured, patchInfo, inputCrc, "already-patched-modified", changed);
  }

  if (sourceRom.length !== patchInfo.sourceSize) {
    throw new Error(
      `Incompatible file: expected ${patchInfo.sourceSize} bytes, got ${sourceRom.length}.`,
    );
  }

  if (inputCrc !== patchInfo.sourceCrc) {
    throw new Error(
      `Unsupported file version. Expected CRC ${formatCrc(patchInfo.sourceCrc)}, got ${formatCrc(inputCrc)}.`,
    );
  }

  const preparedRom = applyBpsPatch(sourceRom, patch);
  return preparationResult(preparedRom, patchInfo, inputCrc, "clean-patched", true);
}

export function patchRom(sourceRom, stageTables, paletteValues, startingRewards = [], weaponPaletteValues = {}, seedMetadata = null) {
  if (!sourceRom) throw new Error("Load a compatible file before generating.");

  const resolvedWeaponPalettes = Object.keys(weaponPaletteValues ?? {}).length > 0
    ? weaponPaletteValues
    : readWeaponPalettes(sourceRom);
  validateRewardTables(stageTables);
  validatePaletteValues(paletteValues);
  validateWeaponPaletteValues(resolvedWeaponPalettes);
  validateStartingRewards(startingRewards);

  const patchedRom = new Uint8Array(sourceRom);
  const previousMetadata = readSeedMetadata(sourceRom);
  const previousCombat = previousMetadata?.optionFlags & 64
    ? createBossWeaknesses(previousMetadata.baseSeed, previousMetadata.combatVersion) : null;
  const bossWeaknesses = seedMetadata?.options?.randomizeBossWeaknesses
    ? createBossWeaknesses(seedMetadata.baseSeed) : null;
  if (seedMetadata && (bossWeaknesses || previousCombat || hasBasePatchSignatures(sourceRom))) {
    patchBossWeaknesses(patchedRom, bossWeaknesses, previousCombat);
  }
  const domeWeapon = seedMetadata
    ? createDomeWeapon(seedMetadata.baseSeed) : 7;
  if (seedMetadata && hasBasePatchSignatures(sourceRom)) {
    const previousDome = previousMetadata?.domeVersion === 1
      ? createDomeWeapon(previousMetadata.baseSeed) : 7;
    patchDomeWeakness(patchedRom, domeWeapon, previousDome);
  }
  const rewardPatch = writeRewardTables(patchedRom, stageTables);
  const bossRewardTexts = hasBasePatchSignatures(sourceRom) ? patchBossRewardText(patchedRom, stageTables) : null;
  const palettePatch = writePalette(patchedRom, paletteValues);
  const weaponPalettePatches = writeWeaponPalettes(patchedRom, resolvedWeaponPalettes);
  const startingPatch = writeStartingTable(patchedRom, startingRewards);
  if (hasKeyMenu(patchedRom)) {
    configureItemTexts(patchedRom,seedMetadata?.options?.showItemTexts ?? hasItemTexts(sourceRom));
  }
  const metadataPatch = seedMetadata ? writeSeedMetadata(patchedRom, seedMetadata, rewardPatch) : null;
  refreshKeyMenu(patchedRom);
  const globalChecksum = fixGlobalChecksum(patchedRom);

  return { rom: patchedRom, rewardPatch, palettePatch, weaponPalettePatches, startingPatch, metadataPatch, globalChecksum, bossWeaknesses, domeWeapon, bossRewardTexts };
}

export function readPalette(rom) {
  const paletteOffset = bankAddressToOffset(PALETTE_BANK, PALETTE_START_ADDRESS);
  ensureRomHasRange(rom, paletteOffset, PALETTE_SIZE);
  return Array.from(rom.slice(paletteOffset, paletteOffset + PALETTE_SIZE));
}

export function readWeaponPalettes(rom) {
  return Object.fromEntries(WEAPON_PALETTES.map((entry) => {
    const offset = bankAddressToOffset(entry.bank, entry.start);
    ensureRomHasRange(rom, offset, entry.length);
    return [entry.id, Array.from(rom.slice(offset, offset + entry.length))];
  }));
}

export function readSeedMetadata(rom) {
  const offset = bankAddressToOffset(ROM_SEED_METADATA_BANK, ROM_SEED_METADATA_ADDRESS);
  if (!rom || offset + ROM_SEED_METADATA_SIZE > rom.length) return null;
  if (!ROM_SEED_METADATA_SIGNATURE.every((value, index) => rom[offset + index] === value)) return null;
  if (![ROM_SEED_METADATA_VERSION, 2, 3, 4].includes(rom[offset + 4])) return null;

  const optionFlags = rom[offset + 5] & 0x7f;
  const mode = STARTING_MODE_NAMES[rom[offset + 6]] ?? "normal";
  const armorMask = rom[offset + 7];
  const weaponMask = rom[offset + 8];
  const zeroMask = rom[offset + 9];
  const baseSeed = Array.from(rom.slice(offset + 10, offset + 18)).map(formatHexByte).join("").toLowerCase();
  const presetLength = Math.min(rom[offset + 18], ROM_SEED_METADATA_SIZE - 19);
  const palettePresetKey = asciiFromBytes(rom.slice(offset + 19, offset + 19 + presetLength)) || "custom";

  return {
    baseSeed,
    optionFlags,
    combatVersion: rom[offset + 4] >= 4 ? 3 : rom[offset + 4],
    domeVersion: rom[offset + 4] >= 4 ? 1 : 0,
    palettePresetKey,
    startingGear: {
      mode,
      selectedItemIds: mode === "custom" ? selectedStartingIdsFromMasks(armorMask, weaponMask, zeroMask) : [],
    },
  };
}

export function validatePaletteValues(paletteValues) {
  if (!Array.isArray(paletteValues) || paletteValues.length !== PALETTE_SIZE) {
    throw new Error(`The palette must contain exactly ${PALETTE_SIZE} bytes.`);
  }

  for (const value of paletteValues) {
    if (!Number.isInteger(value) || value < 0 || value > 0xff) {
      throw new Error("Each palette value must be a hexadecimal byte between 00 and FF.");
    }
  }
}

export function validateWeaponPaletteValues(palettes) {
  if (!palettes || typeof palettes !== "object") throw new Error("Weapon palettes are invalid.");
  for (const entry of WEAPON_PALETTES) {
    const values = palettes[entry.id];
    if (!Array.isArray(values) || values.length !== entry.length) {
      throw new Error(`${entry.name}'s palette must contain exactly ${entry.length} bytes.`);
    }
    validatePaletteValues(values);
  }
}

export function compressStartingRewards(startingRewards) {
  const unique = [];
  const seen = new Set();
  for (const reward of startingRewards) {
    const key = `${reward.type}:${reward.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ ...reward });
  }

  const output = [];
  const handledTypes = new Set();

  for (const reward of unique) {
    if (handledTypes.has(reward.type)) continue;

    const sameType = unique.filter((item) => item.type === reward.type);
    if (reward.type === REWARD_TYPES.ARMOR_PART && includesAllValues(sameType, ARMOR_PARTS)) {
      output.push({ id: "armor-255", kind: "armor", type: reward.type, value: 0xff, label: "All Armor" });
      handledTypes.add(reward.type);
    } else if (reward.type === REWARD_TYPES.ZERO_SKILL && includesAllValues(sameType, ZERO_SKILLS)) {
      output.push({ id: "zero-255", kind: "zero", type: reward.type, value: 0xff, label: "All Zero Skills" });
      handledTypes.add(reward.type);
    } else if (
      reward.type === REWARD_TYPES.BOSS_KEY &&
      (sameType.some((item) => item.value === 0xff) || BOSS_KEY_VALUES.every((value) => sameType.some((item) => item.value === value)))
    ) {
      output.push({ id: "key-255", kind: "key", type: reward.type, value: 0xff, label: "All Boss Keys" });
      handledTypes.add(reward.type);
    } else if (reward.type === REWARD_TYPES.SIGMA_KEY && includesAllValues(sameType, SIGMA_KEYS)) {
      output.push({ id: "key-3", kind: "key", type: reward.type, value: 0x03, label: "All Sigma Keys" });
      handledTypes.add(reward.type);
    } else {
      output.push(...sameType);
      handledTypes.add(reward.type);
    }
  }

  return output;
}

function writeRewardTables(rom, stageTables) {
  const pointerOffset = bankAddressToOffset(REWARD_BANK, POINTER_TABLE_ADDRESS);
  const dataOffset = bankAddressToOffset(REWARD_BANK, REWARD_DATA_ADDRESS);
  const reservedEndOffset = bankAddressToOffset(ROM_SEED_METADATA_BANK, ROM_SEED_METADATA_ADDRESS);
  ensureRomHasRange(rom, pointerOffset, POINTER_TABLE_SIZE);
  ensureRomHasRange(rom, dataOffset, reservedEndOffset - dataOffset);

  const serializedTables = stageTables.map(serializeStageTable);
  const dataSize = serializedTables.reduce((total, table) => total + table.length, 0);
  const freeSpace = reservedEndOffset - dataOffset - dataSize;

  if (freeSpace < 0) {
    throw new Error(`The reward tables use ${dataSize} bytes and overlap seed metadata by ${Math.abs(freeSpace)} bytes.`);
  }

  // Canonicalize the reserved region so rerolling a ROM with shorter tables
  // cannot retain bytes from its previous seed. Do not clear metadata or code.
  rom.fill(0, dataOffset, reservedEndOffset);

  let writeOffset = dataOffset;
  let bankAddress = REWARD_DATA_ADDRESS;

  for (let index = 0; index < serializedTables.length; index += 1) {
    writePointer(rom, pointerOffset + index * 2, bankAddress);
    rom.set(serializedTables[index], writeOffset);
    writeOffset += serializedTables[index].length;
    bankAddress += serializedTables[index].length;
  }

  return {
    dataSize,
    freeSpace,
    pointerAddress: POINTER_TABLE_ADDRESS,
    dataAddress: REWARD_DATA_ADDRESS,
    pointerOffset,
    dataOffset,
  };
}

function serializeStageTable(stageTable) {
  const bytes = [stageTable.entries.length & 0xff];

  for (const entry of stageTable.entries) {
    bytes.push(entry.objectId & 0xff, entry.rewards.length & 0xff);
    for (const reward of entry.rewards) bytes.push(reward.type & 0xff, reward.value & 0xff);
  }

  return Uint8Array.from(bytes);
}

function writeStartingTable(rom, startingRewards) {
  const compressedRewards = compressStartingRewards(startingRewards);
  if (compressedRewards.length > STARTING_TABLE_MAX_ENTRIES) {
    throw new Error(
      `Starting Gear uses ${compressedRewards.length} entries; the patch allows ${STARTING_TABLE_MAX_ENTRIES}.`,
    );
  }

  // The base patch's CALL targets $7D91, inside the final inventory slot.
  // Move its two register saves and far-call stub beyond the reserved table.
  // This also repairs seeds whose table write erased those saves.
  if (hasBasePatchSignatures(rom)) relocateStartingDispatcher(rom);
  const offset = bankAddressToOffset(STARTING_TABLE_BANK, STARTING_TABLE_ADDRESS);
  ensureRomHasRange(rom, offset, STARTING_TABLE_SIZE);
  const bytes = [compressedRewards.length & 0xff];
  for (const reward of compressedRewards) bytes.push(reward.type & 0xff, reward.value & 0xff);

  rom.fill(0, offset, offset + STARTING_TABLE_SIZE);
  rom.set(bytes, offset);

  return {
    bank: STARTING_TABLE_BANK,
    address: STARTING_TABLE_ADDRESS,
    offset,
    dataSize: bytes.length,
    entryCount: compressedRewards.length,
    rewards: compressedRewards,
  };
}

function relocateStartingDispatcher(rom) {
  const call = bankAddressToOffset(STARTING_TABLE_BANK, 0x7d74);
  const oldStub = bankAddressToOffset(STARTING_TABLE_BANK, 0x7d91);
  const newStub = bankAddressToOffset(STARTING_TABLE_BANK, 0x7d93);
  const body = [0x3e,0x3f,0x21,0x17,0x7b,0xc7,0xe1,0xc1,0xc9];
  const matches = (offset, bytes) => bytes.every((b, i) => rom[offset + i] === b);
  const relocated = [0xc5,0xe5,...body];
  if (matches(call, [0xcd,0x93,0x7d]) && matches(newStub, relocated)) return;
  if (!matches(call, [0xcd,0x91,0x7d]) || !matches(oldStub + 2, body) ||
      !matches(oldStub + 11, [0,0])) {
    throw new Error('Unsupported Starting Gear dispatch code.');
  }
  rom.set(relocated, newStub);
  rom.set([0xcd,0x93,0x7d], call);
}

function validateRewardTables(stageTables) {
  if (!Array.isArray(stageTables)) throw new Error("Reward tables are invalid.");
  let heartTankCount = 0;

  for (const stageTable of stageTables) {
    if (!stageTable || !Array.isArray(stageTable.entries)) throw new Error("Reward tables contain an invalid stage.");
    for (const entry of stageTable.entries) {
      if (!entry || !Array.isArray(entry.rewards)) throw new Error("Reward tables contain an invalid location.");
      for (const reward of entry.rewards) {
        validateReward(reward, `${stageTable.stageName ?? "stage"} / ${entry.locationName ?? "location"}`);
        if (reward.type === REWARD_TYPES.HEART_TANK) heartTankCount += 1;
      }
    }
  }

  if (heartTankCount > 8) {
    throw new Error(`The seed contains ${heartTankCount} Heart Tanks; the global maximum is 8.`);
  }
}

function validateStartingRewards(startingRewards) {
  if (!Array.isArray(startingRewards)) throw new Error("Starting Gear is invalid.");
  for (const reward of startingRewards) validateReward(reward, "Starting Gear");
}

function validateReward(reward, context) {
  if (!reward || !Number.isInteger(reward.type) || !Number.isInteger(reward.value)) {
    throw new Error(`${context} contains an invalid reward.`);
  }

  const validValue = reward.type === REWARD_TYPES.HEART_TANK
    ? reward.value >= 1 && reward.value <= 8
    : reward.type === REWARD_TYPES.SUB_TANK
      ? reward.value >= 1 && reward.value <= 4
      : reward.type === REWARD_TYPES.ARMOR_PART
        ? ARMOR_PARTS.some((item) => item.value === reward.value)
        : reward.type === REWARD_TYPES.ZERO_SKILL
          ? ZERO_SKILLS.some((item) => item.value === reward.value)
          : reward.type === REWARD_TYPES.BOSS_KEY
            ? isValidBossKeyValue(reward.value)
            : reward.type === REWARD_TYPES.BOSS_WEAPON
              ? BOSS_WEAPONS.some((item) => item.value === reward.value)
              : reward.type === REWARD_TYPES.SIGMA_KEY
                ? SIGMA_KEYS.some((item) => item.value === reward.value)
                : reward.type === REWARD_TYPES.SHOTOKAN && reward.value === 0x01;

  if (!validValue) {
    throw new Error(`${context} contains an invalid reward value: ${reward.type}:${reward.value}.`);
  }
}

function writePointer(rom, offset, address) {
  if (address < 0x4000 || address > 0x7fff) {
    throw new Error(`Pointer out of range for bank 3F: ${address.toString(16).toUpperCase()}`);
  }
  rom[offset] = address & 0xff;
  rom[offset + 1] = (address >> 8) & 0xff;
}

function writePalette(rom, paletteValues) {
  const paletteOffset = bankAddressToOffset(PALETTE_BANK, PALETTE_START_ADDRESS);
  ensureRomHasRange(rom, paletteOffset, PALETTE_SIZE);
  for (let index = 0; index < PALETTE_SIZE; index += 1) rom[paletteOffset + index] = paletteValues[index] & 0xff;
  return { bank: PALETTE_BANK, startAddress: PALETTE_START_ADDRESS, offset: paletteOffset, values: [...paletteValues] };
}

function writeWeaponPalettes(rom, palettes) {
  return WEAPON_PALETTES.map((entry) => {
    const values = palettes[entry.id];
    const offset = bankAddressToOffset(entry.bank, entry.start);
    ensureRomHasRange(rom, offset, entry.length);
    for (let index = 0; index < entry.length; index += 1) rom[offset + index] = values[index];
    return { ...entry, offset, values: [...values] };
  });
}

function writeSeedMetadata(rom, metadata, rewardPatch) {
  if (rewardPatch && rewardPatch.dataAddress + rewardPatch.dataSize > ROM_SEED_METADATA_ADDRESS) {
    throw new Error("The reward data overlaps the seed data area at 3F:7D20.");
  }

  const offset = bankAddressToOffset(ROM_SEED_METADATA_BANK, ROM_SEED_METADATA_ADDRESS);
  ensureRomHasRange(rom, offset, ROM_SEED_METADATA_SIZE);
  rom.fill(0x00, offset, offset + ROM_SEED_METADATA_SIZE);

  const baseSeedBytes = hexToBytes(metadata.baseSeed);
  const presetBytes = asciiToBytes(String(metadata.palettePresetKey ?? "custom"));
  if (presetBytes.length > ROM_SEED_METADATA_SIZE - 19) {
    throw new Error("The palette preset name is too long to save in the file seed data.");
  }

  ROM_SEED_METADATA_SIGNATURE.forEach((value, index) => { rom[offset + index] = value; });
  rom[offset + 4] = 4; // Combat v3 plus mandatory per-seed dome vulnerability.
  rom[offset + 5] = packOptionFlags(metadata.options);
  rom[offset + 6] = STARTING_MODE_CODES[metadata.startingGear?.mode] ?? STARTING_MODE_CODES.normal;
  rom[offset + 7] = packArmorMask(metadata.startingGear);
  rom[offset + 8] = packWeaponMask(metadata.startingGear);
  rom[offset + 9] = packZeroMask(metadata.startingGear);
  rom.set(baseSeedBytes, offset + 10);
  rom[offset + 18] = presetBytes.length;
  rom.set(presetBytes, offset + 19);

  return {
    bank: ROM_SEED_METADATA_BANK,
    address: ROM_SEED_METADATA_ADDRESS,
    offset,
    size: ROM_SEED_METADATA_SIZE,
  };
}

function selectedStartingRewards(startingGear) {
  const ids = new Set(startingGear?.mode === "custom" ? startingGear.selectedItemIds ?? [] : []);
  return [...ARMOR_PARTS, ...BOSS_WEAPONS, ...ZERO_SKILLS].filter((reward) => ids.has(reward.id));
}

function packArmorMask(startingGear) {
  return selectedStartingRewards(startingGear)
    .filter((reward) => reward.type === REWARD_TYPES.ARMOR_PART)
    .reduce((mask, reward) => mask | reward.value, 0) & 0xff;
}

function packWeaponMask(startingGear) {
  return selectedStartingRewards(startingGear)
    .filter((reward) => reward.type === REWARD_TYPES.BOSS_WEAPON)
    .reduce((mask, reward) => mask | (1 << reward.value), 0) & 0xff;
}

function packZeroMask(startingGear) {
  return selectedStartingRewards(startingGear)
    .filter((reward) => reward.type === REWARD_TYPES.ZERO_SKILL)
    .reduce((mask, reward) => mask | reward.value, 0) & 0xff;
}

function selectedStartingIdsFromMasks(armorMask, weaponMask, zeroMask) {
  return [
    ...ARMOR_PARTS.filter((reward) => (armorMask & reward.value) === reward.value).map((reward) => reward.id),
    ...BOSS_WEAPONS.filter((reward) => (weaponMask & (1 << reward.value)) !== 0).map((reward) => reward.id),
    ...ZERO_SKILLS.filter((reward) => (zeroMask & reward.value) === reward.value).map((reward) => reward.id),
  ];
}

function packOptionFlags(options = {}) {
  return (options.randomizeItems ? 1 : 0) |
    (options.randomizeCapsules ? 2 : 0) |
    (options.randomizeBossRewards ? 4 : 0) |
    (options.lockBossAccess ? 8 : 0) |
    (options.requireFullProgression ? 16 : 0) |
    (options.showItemTexts ? 32 : 0) |
    (options.randomizeBossWeaknesses ? 64 : 0);
}

function hexToBytes(hex) {
  const cleanHex = String(hex ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{16}$/.test(cleanHex)) throw new Error("Seed data is invalid and could not be saved to the file.");
  return Uint8Array.from(Array.from({ length: 8 }, (_, index) => Number.parseInt(cleanHex.slice(index * 2, index * 2 + 2), 16)));
}

function asciiToBytes(value) {
  return Uint8Array.from([...value].map((char) => {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code > 0x7e) throw new Error("Seed data contains unsupported text.");
    return code;
  }));
}

function asciiFromBytes(bytes) {
  return [...bytes].map((value) => value >= 0x20 && value <= 0x7e ? String.fromCharCode(value) : "").join("");
}

function hasBasePatchSignatures(rom) {
  return BASE_PATCH_SIGNATURES.every((signature) =>
    signature.bytes.every((value, index) => rom[signature.offset + index] === value),
  );
}

async function loadBasePatch(showItemTexts = false) {
  let promise = showItemTexts ? itemTextPatchPromise : basePatchPromise;
  if (!promise) {
    promise = fetch(showItemTexts ? ITEM_TEXT_PATCH_URL : BASE_PATCH_URL).then(async (response) => {
      if (!response.ok) throw new Error(`Could not load ${BASE_PATCH_VERSION} (${response.status}).`);
      return new Uint8Array(await response.arrayBuffer());
    }).catch((error) => {
      if (showItemTexts) itemTextPatchPromise = undefined;
      else basePatchPromise = undefined;
      throw error;
    });
    if (showItemTexts) itemTextPatchPromise = promise;
    else basePatchPromise = promise;
  }
  return promise;
}

function preparationResult(rom, patchInfo, inputCrc, status, appliedBasePatch) {
  return {
    rom: new Uint8Array(rom),
    status,
    appliedBasePatch,
    basePatchVersion: BASE_PATCH_VERSION,
    inputCrc,
    outputCrc: crc32(rom),
    cleanRomCrc: patchInfo.sourceCrc,
    basePatchedCrc: patchInfo.targetCrc,
  };
}

function includesAllValues(rewards, expectedRewards) {
  return expectedRewards.every((expected) => rewards.some((reward) => reward.value === expected.value));
}

function bankAddressToOffset(bank, address) {
  if (address < 0x4000 || address > 0x7fff) return bank * BANK_SIZE + address;
  return bank * BANK_SIZE + (address - 0x4000);
}

function ensureRomHasRange(rom, offset, length) {
  if (offset < 0 || offset + length > rom.length) {
    throw new Error(`The file is too small to write at 0x${offset.toString(16).toUpperCase()}. Current size: ${rom.length} bytes.`);
  }
}

function fixGlobalChecksum(rom) {
  ensureRomHasRange(rom, GLOBAL_CHECKSUM_HIGH_OFFSET, 2);
  let checksum = 0;

  for (let index = 0; index < rom.length; index += 1) {
    if (index === GLOBAL_CHECKSUM_HIGH_OFFSET || index === GLOBAL_CHECKSUM_LOW_OFFSET) continue;
    checksum = (checksum + rom[index]) & 0xffff;
  }

  rom[GLOBAL_CHECKSUM_HIGH_OFFSET] = (checksum >> 8) & 0xff;
  rom[GLOBAL_CHECKSUM_LOW_OFFSET] = checksum & 0xff;
  return checksum;
}

function formatHexByte(value) {
  return (value & 0xff).toString(16).padStart(2, "0").toUpperCase();
}
