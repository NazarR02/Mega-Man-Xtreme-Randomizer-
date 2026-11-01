import {
  findPresetKeyByValues, formatPaletteValue, getPreset,
  getPresetOptions, getPreviewColors, normalizePaletteValues,
} from "./palette.js?v=full-progression-1";
import { createBpsPatch } from "./bps.js?v=release-1.2.1";
import { drawArmoredCharacterPreview, drawCharacterPreview } from "./preview.js?v=palette-update-5";
import { patchRom, prepareRom, readPalette, readRomFile, readSeedMetadata, readWeaponPalettes } from "./rom.js?v=release-1.2.2";
import {
  createRandomizerSettings, createRandomizerSettingsFromRomMetadata, createSpoilerLog, generateRandomizationFromSettings, parseRandomizationSeed,
} from "./randomizer.js?v=release-1.2.2";
import { getStartingGearGroups, WEAPON_PALETTES } from "./tables.js?v=full-progression-1";
import { getLocale, setLocale, t, translateDocument } from "./i18n.js?v=release-1.2.1";

const elements = {
  disclaimerOverlay: document.querySelector("#disclaimerOverlay"), acceptDisclaimerButton: document.querySelector("#acceptDisclaimerButton"),
  romFile: document.querySelector("#romFile"), fileName: document.querySelector("#fileName"),
  languageToggle: document.querySelector("#languageToggle"),
  romPreparation: document.querySelector("#romPreparation"), romStatus: document.querySelector("#romStatus"),
  validStatus: document.querySelector("#validStatus"), seedInput: document.querySelector("#seedInput"),
  seedButton: document.querySelector("#seedButton"), randomizeItems: document.querySelector("#randomizeItems"),
  randomizeCapsules: document.querySelector("#randomizeCapsules"), randomizeBossRewards: document.querySelector("#randomizeBossRewards"),
  lockBossAccess: document.querySelector("#lockBossAccess"), requireFullProgression: document.querySelector("#requireFullProgression"),
  showItemTexts: document.querySelector("#showItemTexts"),
  randomizeBossWeaknesses: document.querySelector('#randomizeBossWeaknesses'),
  generateSpoilerLog: document.querySelector("#generateSpoilerLog"),
  startingModeInputs: [...document.querySelectorAll('input[name="startingGearMode"]')],
  startingGearHint: document.querySelector("#startingGearHint"), customStartingGear: document.querySelector("#customStartingGear"),
  palettePreset: document.querySelector("#palettePreset"), palettePresetControls: document.querySelector("#palettePresetControls"),
  paletteEditorTitle: document.querySelector("#paletteEditorTitle"), previewPaletteTabs: document.querySelector("#previewPaletteTabs"),
  paletteHelpButton: document.querySelector("#paletteHelpButton"), paletteHelpPanel: document.querySelector("#paletteHelpPanel"),
  savePalettesButton: document.querySelector("#savePalettesButton"), loadPalettesButton: document.querySelector("#loadPalettesButton"),
  paletteFileInput: document.querySelector("#paletteFileInput"),
  playerPaletteInputs: document.querySelector("#playerPaletteInputs"),
  paletteSwatches: document.querySelector("#paletteSwatches"), characterCanvas: document.querySelector("#characterCanvas"),
  armoredCharacterCanvas: document.querySelector("#armoredCharacterCanvas"), generateButton: document.querySelector("#generateButton"),
  downloadBpsButton: document.querySelector("#downloadBpsButton"),
  messageBox: document.querySelector("#messageBox"), toastBox: document.querySelector("#toastBox"),
};

let toastTimer = null;
let generationRequest = 0;

const emptyWeaponPalettes = () => Object.fromEntries(WEAPON_PALETTES.map((entry) => [entry.id, [...entry.defaultValues]]));
const state = {
  inputRom: null, sourceRom: null, romPreparation: null, patchedRom: null, bpsPatch: null,
  lastResult: null, spoilerText: "", paletteValues: [], weaponPaletteValues: emptyWeaponPalettes(),
  activePaletteId: "x", applyingSeed: false, hidePalettePreview: false,
  surprisePaletteValues: null, surpriseWeaponPaletteValues: null,
  selectedRomFile: null, romStatusKey: "romNotLoaded", romPreparationKey: "autoPatch",
  validStatusKey: "noSeed", validStatusText: "",
};

initialize();

function initialize() {
  translateDocument();
  refreshLanguageToggle();
  populatePalettePresets();
  populateStartingGear();
  buildByteInputs(elements.playerPaletteInputs, "palette-value-input", handlePaletteInput);
  buildPreviewPaletteTabs();
  applyPalettePreset("normal", { keepSeed: true });
  applyOptionTooltips();
  bindEvents();
  updateStartingModeUi();
  resetGeneratedState();
  updateAllPreviews();
  refreshStatusTexts();
}

function populatePalettePresets() {
  const selectedValue = elements.palettePreset.value;
  elements.palettePreset.replaceChildren();
  const customOption = new Option(t("customPreset"), "custom");
  elements.palettePreset.appendChild(customOption);
  for (const option of getPresetOptions()) elements.palettePreset.appendChild(new Option(option.label, option.key));
  const randomOption = new Option(t("randomAllPalettes"), "random_all");
  randomOption.title = t("randomAllPalettesHelp");
  elements.palettePreset.appendChild(randomOption);
  const chaosOption = new Option(t("chaosAllPalettes"), "chaos_all");
  chaosOption.title = t("chaosAllPalettesHelp");
  elements.palettePreset.appendChild(chaosOption);
  if ([...elements.palettePreset.options].some((option) => option.value === selectedValue)) elements.palettePreset.value = selectedValue;
}

function populateStartingGear() {
  const groups = getStartingGearGroups().map((group) => {
    const section = document.createElement("section"); section.className = "starting-gear-group";
    const heading = document.createElement("h3"); heading.textContent = group.label;
    const grid = document.createElement("div"); grid.className = "starting-item-grid";
    for (const item of group.items) {
      const label = document.createElement("label"); label.className = "starting-item-option";
      const input = document.createElement("input"); input.type = "checkbox"; input.value = item.id;
      const text = document.createElement("span"); text.textContent = item.label;
      label.append(input, text); grid.appendChild(label);
    }
    section.append(heading, grid); return section;
  });
  const confirmButton = document.createElement("button");
  confirmButton.type = "button"; confirmButton.className = "custom-starting-confirm"; confirmButton.textContent = t("confirmSelection");
  confirmButton.addEventListener("click", () => { elements.customStartingGear.hidden = true; });
  elements.customStartingGear.replaceChildren(...groups, confirmButton);
}

function buildByteInputs(container, className, handler) {
  container.replaceChildren(...Array.from({ length: 8 }, (_, index) => {
    const label = document.createElement("label");
    const colorName = t(`color${Math.floor(index / 2)}`);
    const byteName = t(index % 2 === 0 ? "lowByte" : "highByte");
    const caption = document.createElement("span"); caption.textContent = `${colorName} - ${byteName}`;
    const input = document.createElement("input"); input.className = `palette-input ${className}`;
    input.dataset.index = String(index); input.maxLength = 2; input.spellcheck = false; input.inputMode = "text";
    input.addEventListener("input", handler); label.append(caption, input); return label;
  }));
}

function buildPreviewPaletteTabs() {
  const entries = [{ id: "x", weaponName: "X" }, ...WEAPON_PALETTES];
  elements.previewPaletteTabs.replaceChildren(...entries.map((entry) => {
    const button = document.createElement("button"); button.type = "button"; button.textContent = entry.weaponName;
    button.title = entry.id === "x" ? t("xPaletteHelp") : t("weaponPaletteHelp").replace("{weapon}", entry.weaponName);
    button.dataset.paletteId = entry.id;
    button.addEventListener("click", () => { state.activePaletteId = entry.id; renderActivePalette(); });
    return button;
  }));
  renderActivePalette();
}

function renderActivePalette() {
  const weapon = WEAPON_PALETTES.find(({ id }) => id === state.activePaletteId);
  elements.previewPaletteTabs.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.paletteId === state.activePaletteId;
    button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active));
  });
  elements.paletteEditorTitle.textContent = weapon ? weapon.weaponName : t("originalXPalette");
  elements.palettePresetControls.hidden = false;
  updatePalettePresetSelection();
  syncPaletteInputs();
  updateAllPreviews();
}

function bindEvents() {
  elements.acceptDisclaimerButton.addEventListener("click", () => { elements.disclaimerOverlay.hidden = true; });
  elements.languageToggle.addEventListener("click", handleLanguageToggle);
  elements.romFile.addEventListener("change", handleRomSelected);
  elements.seedButton.addEventListener("click", () => applySeedFromInput());
  elements.seedInput.addEventListener("change", () => { if (elements.seedInput.value.trim()) applySeedFromInput(); });
  elements.palettePreset.addEventListener("change", () => {
    if (elements.palettePreset.value === "random_all") randomizeAllPalettes("balanced");
    else if (elements.palettePreset.value === "chaos_all") randomizeAllPalettes("chaos");
    else if (elements.palettePreset.value !== "custom") applyPalettePreset(elements.palettePreset.value);
    else { clearSurprisePreview(); renderActivePalette(); }
  });
  [elements.randomizeItems, elements.randomizeCapsules, elements.randomizeBossRewards, elements.lockBossAccess, elements.requireFullProgression, elements.showItemTexts, elements.randomizeBossWeaknesses]
    .forEach((input) => input.addEventListener("change", handleSettingsChanged));
  elements.startingModeInputs.forEach((input) => {
    input.addEventListener("change", () => { updateStartingModeUi(); handleSettingsChanged(); });
    input.addEventListener("click", () => { if (input.value === "custom") elements.customStartingGear.hidden = false; });
  });
  elements.customStartingGear.addEventListener("change", handleSettingsChanged);
  elements.generateButton.addEventListener("click", handleGenerate);
  elements.downloadBpsButton.addEventListener("click", handleDownloadBps);
  elements.savePalettesButton.addEventListener("click", handleSavePalettes);
  elements.loadPalettesButton.addEventListener("click", () => elements.paletteFileInput.click());
  elements.paletteFileInput.addEventListener("change", handleLoadPalettes);
  elements.paletteHelpButton.addEventListener("click", togglePaletteHelp);
  elements.toastBox.addEventListener("click", hideToast);
}

function handleLanguageToggle() {
  setLocale(getLocale() === "en" ? "es" : "en");
  refreshLocalizedUi();
}

function refreshLocalizedUi({ rebuildControls = true } = {}) {
  translateDocument();
  refreshLanguageToggle();
  if (rebuildControls) {
    const startingGear = readStartingGear();
    populatePalettePresets();
    populateStartingGear();
    applyStartingGear(startingGear);
    buildByteInputs(elements.playerPaletteInputs, "palette-value-input", handlePaletteInput);
    syncPaletteInputs();
  }
  applyOptionTooltips();
  buildPreviewPaletteTabs();
  renderActivePalette();
  updateStartingModeUi();
  updateAllPreviews();
  refreshStatusTexts();
}

function refreshLanguageToggle() {
  elements.languageToggle.textContent = t("languageToggle");
  elements.languageToggle.title = t("languageToggleHelp");
  elements.languageToggle.setAttribute("aria-label", t("languageToggleHelp"));
}

function refreshStatusTexts() {
  if (state.selectedRomFile) elements.fileName.textContent = `${state.selectedRomFile.name} (${formatBytes(state.selectedRomFile.size)})`;
  else elements.fileName.textContent = t("loadRomHint");
  elements.romPreparation.textContent = t(state.romPreparationKey);
  setStatus(elements.romStatus, t(state.romStatusKey), elements.romStatus.dataset.mode || "muted");
  if (state.validStatusKey) setStatus(elements.validStatus, t(state.validStatusKey), elements.validStatus.dataset.mode || "muted");
  else setStatus(elements.validStatus, state.validStatusText, elements.validStatus.dataset.mode || "ready");
}

function togglePaletteHelp() {
  const shouldOpen = elements.paletteHelpPanel.hidden;
  elements.paletteHelpPanel.hidden = !shouldOpen;
  elements.paletteHelpButton.setAttribute("aria-expanded", String(shouldOpen));
}

function applyOptionTooltips() {
  const optionHelp = new Map([
    [elements.randomizeItems, "randomizeItemsHelp"], [elements.randomizeCapsules, "randomizeArmorHelp"],
    [elements.randomizeBossRewards, "randomizeBossRewardsHelp"], [elements.lockBossAccess, "lockBossAccessHelp"],
    [elements.requireFullProgression, "requireFullProgressionHelp"], [elements.showItemTexts, "showItemTextsHelp"], [elements.generateSpoilerLog, "generateSpoilerLogHelp"],
    [elements.randomizeBossWeaknesses, 'randomizeBossWeaknessesHelp'],
  ]);
  optionHelp.forEach((key, input) => { input.closest("label").title = t(key); });
  const startingHelp = { none: "startNoneHint", normal: "startNormalHint", generous: "startGenerousHint", custom: "startCustomHint" };
  elements.startingModeInputs.forEach((input) => { input.closest("label").title = t(startingHelp[input.value]); });
}

let romLoadRequest = 0;

async function handleRomSelected(event) {
  const file = event.target.files?.[0]; if (!file) return;
  const request = ++romLoadRequest;
  state.inputRom = null; state.sourceRom = null; state.romPreparation = null;
  resetGeneratedState({ keepSeed: true });
  elements.generateButton.disabled = true;
  try {
    state.romStatusKey = "preparingRom"; state.romPreparationKey = "autoPatch"; state.selectedRomFile = file;
    setLocalizedStatus(elements.romStatus, "preparingRom", "muted"); showMessage(t("verifyingRom"));
    const inputRom = await readRomFile(file);
    if (request !== romLoadRequest) return;
    const preparation = await prepareRom(inputRom, { showItemTexts: Boolean(elements.showItemTexts?.checked) });
    if (request !== romLoadRequest) return;
    state.inputRom = inputRom;
    state.sourceRom = preparation.rom; state.romPreparation = preparation;
    state.paletteValues = readPalette(state.sourceRom); state.weaponPaletteValues = readWeaponPalettes(state.sourceRom);
    clearSurprisePreview();
    resetGeneratedState({ keepSeed: true });
    if (elements.seedInput.value.trim()) applySeedFromInput({ silent: true });
    else {
      const seedMetadata = readSeedMetadata(state.sourceRom);
      if (seedMetadata) applyRomSeedMetadata(seedMetadata);
      else { elements.palettePreset.value = findPresetKeyByValues(state.paletteValues); renderActivePalette(); }
    }
    state.romPreparationKey = preparation.appliedBasePatch ? "cleanRomPatched" : "patchDetected";
    state.romStatusKey = preparation.appliedBasePatch ? "romPrepared" : "romCompatible";
    refreshStatusTexts();
    if (!elements.messageBox.classList.contains("error")) clearMessage();
  } catch (error) {
    if (request !== romLoadRequest) return;
    state.inputRom = null; state.sourceRom = null; state.romPreparation = null; state.selectedRomFile = null; resetGeneratedState({ keepSeed: true });
    state.romPreparationKey = "romPreparationFailed"; state.romStatusKey = "romIncompatible";
    refreshStatusTexts(); setLocalizedStatus(elements.romStatus, "romIncompatible", "error"); showMessage(error.message, "error");
  } finally {
    if (request === romLoadRequest) elements.generateButton.disabled = !state.sourceRom;
  }
}

function applyRomSeedMetadata(seedMetadata) {
  const settings = createRandomizerSettingsFromRomMetadata(seedMetadata, state.paletteValues, state.weaponPaletteValues);
  applySettingsToUi(settings);
  resetGeneratedState({ keepSeed: true });
  elements.seedInput.value = settings.encodedSeed;
  state.validStatusKey = null; state.validStatusText = settings.seedName;
  setStatus(elements.validStatus, settings.seedName, "ready");
}

function applyPalettePreset(key, { keepSeed = false } = {}) {
  clearSurprisePreview();
  if (state.activePaletteId === "x") state.paletteValues = [...getPreset(key).values];
  else state.weaponPaletteValues[state.activePaletteId] = [...getPreset(key).values];
  elements.palettePreset.value = key;
  syncPaletteInputs(); updateAllPreviews(); if (!keepSeed) handleSettingsChanged();
}

function randomizeAllPalettes(mode = "balanced") {
  const createPalette = mode === "chaos" ? createChaosRandomPalette : createRandomMiddleColorsPalette;
  if (!state.hidePalettePreview || !state.surprisePaletteValues || !state.surpriseWeaponPaletteValues) {
    state.surprisePaletteValues = [...state.paletteValues];
    state.surpriseWeaponPaletteValues = clonePalettes(state.weaponPaletteValues);
  }
  state.paletteValues = createPalette(state.paletteValues);
  state.weaponPaletteValues = Object.fromEntries(WEAPON_PALETTES.map((entry) => [entry.id, createPalette(state.weaponPaletteValues[entry.id])]));
  state.hidePalettePreview = true;
  elements.palettePreset.value = mode === "chaos" ? "chaos_all" : "random_all";
  syncPaletteInputs();
  updateAllPreviews();
  handleSettingsChanged();
  showToast(t("palettesRandomized"), "success");
}

function createChaosRandomPalette() {
  const values = new Uint8Array(8);
  crypto.getRandomValues(values);
  for (let index = 1; index < values.length; index += 2) values[index] &= 0x7f;
  return Array.from(values);
}

function createRandomMiddleColorsPalette(sourcePalette) {
  const base = normalizePaletteValues(sourcePalette);
  const values = new Uint8Array(4);
  crypto.getRandomValues(values);
  values[1] &= 0x7f;
  values[3] &= 0x7f;
  return [base[0], base[1], ...Array.from(values), base[6], base[7]];
}

function handlePaletteInput() {
  clearSurprisePreview();
  const values = normalizePaletteValues([...elements.playerPaletteInputs.querySelectorAll(".palette-value-input")].map((input) => input.value));
  if (state.activePaletteId === "x") {
    state.paletteValues = values; elements.palettePreset.value = "custom";
  } else {
    state.weaponPaletteValues[state.activePaletteId] = values; elements.palettePreset.value = "custom";
  }
  syncPaletteInputs(false); updateAllPreviews(); handleSettingsChanged();
}

function getActivePaletteValues() {
  return state.activePaletteId === "x" ? state.paletteValues : state.weaponPaletteValues[state.activePaletteId];
}

function updatePalettePresetSelection() {
  if (state.hidePalettePreview) return;
  elements.palettePreset.value = findPresetKeyByValues(getActivePaletteValues());
}

function getSurprisePreviewPaletteValues() {
  if (state.activePaletteId === "x") return state.surprisePaletteValues ?? getPreset("normal").values;
  const weapon = WEAPON_PALETTES.find(({ id }) => id === state.activePaletteId);
  return state.surpriseWeaponPaletteValues?.[state.activePaletteId] ?? weapon?.defaultValues ?? getPreset("normal").values;
}

function syncPaletteInputs(forceFormat = true) {
  if (state.hidePalettePreview) {
    [...elements.playerPaletteInputs.querySelectorAll(".palette-value-input")].forEach((input) => {
      input.value = ""; input.placeholder = "??"; input.disabled = true;
    });
    return;
  }
  syncInputs([...elements.playerPaletteInputs.querySelectorAll(".palette-value-input")], getActivePaletteValues(), forceFormat);
}

function syncInputs(inputs, values, forceFormat) {
  inputs.forEach((input, index) => { input.disabled = false; input.placeholder = ""; input.value = forceFormat ? formatPaletteValue(values[index] ?? 0) : sanitizeByte(input.value); });
}

function sanitizeByte(value) { return value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 2); }

function updateAllPreviews() {
  if (state.hidePalettePreview) {
    const colors = getPreviewColors(getSurprisePreviewPaletteValues());
    drawCharacterPreview(elements.characterCanvas, colors); drawArmoredCharacterPreview(elements.armoredCharacterCanvas, colors);
    renderColorSwatches(elements.paletteSwatches, colors);
    return;
  }
  const colors = getPreviewColors(getActivePaletteValues());
  drawCharacterPreview(elements.characterCanvas, colors); drawArmoredCharacterPreview(elements.armoredCharacterCanvas, colors);
  renderColorSwatches(elements.paletteSwatches, colors);
}

function renderColorSwatches(container, colors) {
  container.replaceChildren(...colors.map((color, index) => {
    const swatch = document.createElement("span"); swatch.className = "swatch"; swatch.style.background = color;
    swatch.style.color = getReadableTextColor(color); swatch.textContent = t(`color${index}`); swatch.title = t(`color${index}`); return swatch;
  }));
}

function updateStartingModeUi() {
  const hints = {
    none: t("startNoneHint"), normal: t("startNormalHint"), generous: t("startGenerousHint"), custom: t("startCustomHint"),
  };
  const mode = getStartingMode(); elements.startingGearHint.textContent = hints[mode]; elements.customStartingGear.hidden = mode !== "custom";
}

function handleSettingsChanged() { if (!state.applyingSeed) resetGeneratedState(); }

function applySeedFromInput({ silent = false } = {}) {
  if (!elements.seedInput.value.trim()) { if (!silent) showToast(t("pasteSeed"), "error"); return null; }
  try {
    const settings = parseRandomizationSeed(elements.seedInput.value.trim()); state.applyingSeed = true;
    clearSurprisePreview();
    applyOptions(settings.options); applyStartingGear(settings.startingGear); state.paletteValues = [...settings.paletteValues];
    if (Object.keys(settings.weaponPaletteValues).length) state.weaponPaletteValues = clonePalettes(settings.weaponPaletteValues);
    elements.palettePreset.value = settings.palettePresetKey; renderActivePalette(); state.applyingSeed = false;
    resetGeneratedState({ keepSeed: true }); elements.seedInput.value = settings.encodedSeed;
    state.validStatusKey = null; state.validStatusText = settings.seedName;
    setStatus(elements.validStatus, settings.seedName, "ready"); if (!silent) showToast(t("seedLoadedMessage"), "success"); return settings;
  } catch (error) { state.applyingSeed = false; state.validStatusKey = "invalidSeed"; setLocalizedStatus(elements.validStatus, "invalidSeed", "error"); showMessage(error.message, "error"); return null; }
}

async function handleGenerate() {
  const request = ++generationRequest;
  try {
    if (!state.sourceRom || !state.romPreparation) throw new Error(t("loadCompatibleRom"));
    const settings = createRandomizerSettings({ seedText: elements.seedInput.value, options: readOptions(), paletteValues: state.paletteValues,
      palettePresetKey: elements.palettePreset.value, weaponPaletteValues: state.weaponPaletteValues, startingGear: readStartingGear() });
    const preserveSurprisePreview = state.hidePalettePreview;
    applySettingsToUi(settings, { preserveSurprisePreview });
    const result = generateRandomizationFromSettings(settings);
    const source = state.sourceRom;
    const prepared = await prepareRom(state.inputRom ?? source, { showItemTexts: result.options.showItemTexts });
    if (request !== generationRequest || source !== state.sourceRom) return;
    const patched = patchRom(prepared.rom, result.stageTables, result.paletteValues, result.startingRewards, result.weaponPaletteValues, {
      baseSeed: result.baseSeed,
      options: result.options,
      palettePresetKey: result.palettePresetKey,
      startingGear: result.startingGear,
    });
    state.lastResult = result; state.patchedRom = patched.rom;
    state.bpsPatch = createBpsPatch(state.inputRom ?? state.sourceRom, patched.rom);
    elements.downloadBpsButton.disabled = false;
    state.spoilerText = elements.generateSpoilerLog.checked ? createSpoilerLog(result) : "";
    elements.seedInput.value = result.seed;
    downloadBlob(patched.rom, buildDownloadName(result.seedName), "application/octet-stream");
    if (state.spoilerText) {
      downloadBlob(state.spoilerText, buildSpoilerName(result.seedName, result.baseSeed), "text/plain;charset=utf-8");
    }
    state.validStatusKey = null; state.validStatusText = result.seedName;
    setStatus(elements.validStatus, result.seedName, "ready"); clearMessage();
  } catch (error) {
    if (request !== generationRequest) return;
    state.patchedRom = null; state.bpsPatch = null; state.lastResult = null; state.spoilerText = "";
    elements.downloadBpsButton.disabled = true;
    state.validStatusKey = "error";
    setLocalizedStatus(elements.validStatus, "error", "error"); showMessage(error.message, "error");
  }
}

function handleDownloadBps() {
  if (!state.bpsPatch || !state.lastResult) return;
  downloadBlob(state.bpsPatch, buildBpsName(state.lastResult.seedName), "application/octet-stream");
}

function handleSavePalettes() {
  const palettes = { x: paletteValuesToHex(state.paletteValues) };
  for (const entry of WEAPON_PALETTES) palettes[entry.id] = paletteValuesToHex(state.weaponPaletteValues[entry.id]);
  const content = `${JSON.stringify({ format: "mega-man-xtreme-palettes", version: 1, palettes }, null, 2)}\n`;
  downloadBlob(content, "mega-man-xtreme-palettes.txt", "text/plain;charset=utf-8");
  showToast(t("palettesSaved"), "success");
}

async function handleLoadPalettes(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const palettes = payload?.format === "mega-man-xtreme-palettes" && payload?.version === 1 ? payload.palettes : null;
    if (!palettes || typeof palettes !== "object") throw new Error(t("invalidPaletteFile"));
    const playerPalette = paletteHexToValues(palettes.x);
    const weaponPalettes = Object.fromEntries(WEAPON_PALETTES.map((entry) => [entry.id, paletteHexToValues(palettes[entry.id])]));
    state.paletteValues = playerPalette;
    state.weaponPaletteValues = weaponPalettes;
    clearSurprisePreview();
    elements.palettePreset.value = findPresetKeyByValues(playerPalette);
    renderActivePalette();
    handleSettingsChanged();
    showToast(t("palettesLoaded"), "success");
  } catch (error) {
    showMessage(error instanceof SyntaxError ? t("invalidPaletteFile") : error.message, "error");
  }
}

function paletteValuesToHex(values) {
  return normalizePaletteValues(values).map(formatPaletteValue).join("");
}

function paletteHexToValues(value) {
  const hex = String(value ?? "").trim();
  if (!/^[0-9a-fA-F]{16}$/.test(hex)) throw new Error(t("invalidPaletteFile"));
  return Array.from({ length: 8 }, (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}

function readOptions() { return { randomizeItems: elements.randomizeItems.checked, randomizeCapsules: elements.randomizeCapsules.checked,
  randomizeBossRewards: elements.randomizeBossRewards.checked, lockBossAccess: elements.lockBossAccess.checked,
  requireFullProgression: elements.requireFullProgression.checked, showItemTexts: elements.showItemTexts.checked,
  randomizeBossWeaknesses: Boolean(elements.randomizeBossWeaknesses?.checked) }; }
function applyOptions(options) { elements.randomizeItems.checked = Boolean(options.randomizeItems); elements.randomizeCapsules.checked = Boolean(options.randomizeCapsules);
  elements.randomizeBossRewards.checked = Boolean(options.randomizeBossRewards); elements.lockBossAccess.checked = Boolean(options.lockBossAccess);
  elements.requireFullProgression.checked = Boolean(options.requireFullProgression); elements.showItemTexts.checked = Boolean(options.showItemTexts);
  if (elements.randomizeBossWeaknesses) elements.randomizeBossWeaknesses.checked = Boolean(options.randomizeBossWeaknesses); }
function readStartingGear() { return { mode: getStartingMode(), selectedItemIds: [...elements.customStartingGear.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value) }; }
function applyStartingGear(gear) { elements.startingModeInputs.forEach((input) => { input.checked = input.value === gear.mode; });
  const selected = new Set(gear.selectedItemIds ?? []); elements.customStartingGear.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = selected.has(input.value); }); updateStartingModeUi(); }
function getStartingMode() { return elements.startingModeInputs.find((input) => input.checked)?.value ?? "normal"; }

function applySettingsToUi(settings, { preserveSurprisePreview = false } = {}) {
  state.applyingSeed = true; applyOptions(settings.options); applyStartingGear(settings.startingGear); state.paletteValues = [...settings.paletteValues];
  state.weaponPaletteValues = clonePalettes(settings.weaponPaletteValues);
  if (!preserveSurprisePreview) clearSurprisePreview();
  elements.palettePreset.value = settings.palettePresetKey;
  renderActivePalette(); state.applyingSeed = false;
}

function resetGeneratedState({ keepSeed = false } = {}) {
  generationRequest += 1;
  state.patchedRom = null; state.bpsPatch = null; state.lastResult = null; state.spoilerText = "";
  elements.downloadBpsButton.disabled = true;
  if (!keepSeed) { elements.seedInput.value = ""; state.validStatusKey = "noSeed"; state.validStatusText = ""; setLocalizedStatus(elements.validStatus, "noSeed", "muted"); }
}

function clonePalettes(palettes) { return Object.fromEntries(Object.entries(palettes).map(([id, values]) => [id, [...values]])); }
function clearSurprisePreview() {
  state.hidePalettePreview = false;
  state.surprisePaletteValues = null;
  state.surpriseWeaponPaletteValues = null;
}
function setStatus(element, text, mode) { element.textContent = text; element.className = `status-pill ${mode ?? ""}`.trim(); element.dataset.mode = mode ?? ""; }
function setLocalizedStatus(element, key, mode) { setStatus(element, t(key), mode); }
function showMessage(message, mode = "") { elements.messageBox.hidden = false; elements.messageBox.textContent = message; elements.messageBox.className = `message-box ${mode}`.trim(); }
function clearMessage() { elements.messageBox.hidden = true; elements.messageBox.textContent = ""; elements.messageBox.className = "message-box"; }
function showToast(message, mode = "") {
  if (toastTimer) window.clearTimeout(toastTimer);
  elements.toastBox.hidden = false; elements.toastBox.textContent = message;
  elements.toastBox.className = `toast-bubble ${mode}`.trim();
  toastTimer = window.setTimeout(hideToast, 3600);
}
function hideToast() {
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = null; elements.toastBox.hidden = true;
}
function downloadBlob(content, fileName, mimeType) { const url = URL.createObjectURL(new Blob([content], { type: mimeType })); const link = document.createElement("a");
  link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
function getReadableTextColor(color) { const rgb = [0, 2, 4].map((index) => Number.parseInt(color.replace("#", "").slice(index, index + 2), 16) || 0);
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 >= 150 ? "#101928" : "#ffffff"; }
function formatBytes(bytes) { return `${Number(bytes).toLocaleString(getLocale() === "es" ? "es" : "en-US")} bytes`; }
function slugify(value) { return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function buildDownloadName(seedName) { return `${slugify(seedName)}.gbc`; }
function buildBpsName(seedName) { return `${slugify(seedName)}.bps`; }
function buildSpoilerName(seedName, baseSeed) {
  const seedValue = slugify(baseSeed);
  return `${slugify(seedName)}-${seedValue}-spoiler.txt`;
}
