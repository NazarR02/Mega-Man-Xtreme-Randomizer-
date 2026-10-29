import { PALETTE_PRESETS } from "./tables.js?v=full-progression-1";

export function getPresetOptions() {
  return Object.entries(PALETTE_PRESETS).map(([key, preset]) => ({
    key,
    label: preset.label,
  }));
}

export function getPreset(key) {
  return PALETTE_PRESETS[key] ?? PALETTE_PRESETS.normal;
}

export function normalizePaletteValues(values) {
  const sourceValues = Array.isArray(values) ? values : [];
  // Older palette payloads stored only colors 1 and 2.
  const expandedValues = sourceValues.length === 4
    ? [0x73, 0x46, ...sourceValues, 0x42, 0x08]
    : sourceValues;
  return Array.from({ length: 8 }, (_, index) => clampByte(parseHexByte(expandedValues[index] ?? 0)));
}

export function formatPaletteValue(value) {
  return clampByte(value).toString(16).padStart(2, "0").toUpperCase();
}

export function findPresetKeyByValues(values) {
  const normalizedValues = normalizePaletteValues(values);
  const match = Object.entries(PALETTE_PRESETS).find(([, preset]) => sameValues(normalizedValues, preset.values));
  return match?.[0] ?? "custom";
}

export function getPreviewColors(values) {
  return decodeFullObjPalette(values);
}

export function formatGbcPaletteWords(values) {
  const normalizedValues = normalizePaletteValues(values);
  return [0, 2, 4, 6].map((offset) =>
    readLittleEndianWord(normalizedValues, offset).toString(16).padStart(4, "0").toUpperCase(),
  );
}

function decodeFullObjPalette(values) {
  const normalizedValues = normalizePaletteValues(values);
  return [0, 2, 4, 6].map((offset) => gbcWordToCss(readLittleEndianWord(normalizedValues, offset)));
}

function readLittleEndianWord(values, offset) {
  return values[offset] | (values[offset + 1] << 8);
}

function gbcWordToCss(word) {
  const red = word & 0x1f;
  const green = (word >> 5) & 0x1f;
  const blue = (word >> 10) & 0x1f;
  return rgbToHex(scale5Bit(red), scale5Bit(green), scale5Bit(blue));
}

function scale5Bit(value) {
  return Math.round((value / 31) * 255);
}

function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function parseHexByte(value) {
  if (typeof value === "number") {
    return value;
  }

  const clean = String(value ?? "")
    .replace(/[^0-9a-f]/gi, "")
    .slice(0, 2);

  if (clean.length === 0) {
    return 0;
  }

  return Number.parseInt(clean, 16);
}

function clampByte(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(255, value));
}

function sameValues(a, b) {
  return a.length === b.length && a.every((value, index) => clampByte(value) === clampByte(b[index]));
}
