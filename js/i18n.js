export const translations = Object.freeze({
  es: {
    disclaimerEyebrow: "Aviso legal",
    disclaimerTitle: "Usa solo tu propia copia del juego",
    disclaimerBody: "Esta herramienta no incluye ni proporciona archivos del juego, contenido protegido, BIOS, gráficos, audio ni otros materiales propietarios.",
    disclaimerNoFiles: "Debes usar una copia obtenida legalmente. Al continuar confirmas que entiendes esto y que eres responsable del uso que hagas de la herramienta.",
    acceptDisclaimer: "Entiendo y continuar",
    confirmSelection: "OK",
    palettesSaved: "Las nueve paletas se guardaron en un archivo TXT.",
    palettesLoaded: "Se cargaron correctamente las nueve paletas.",
    palettesRandomized: "Se generaron colores aleatorios para las nueve paletas.",
    romNotLoaded: "Archivo no cargado", noSeed: "No generada", generatedSeed: "Seed generada", seedGeneratedStatus: "Generada",
    controlsLabel: "Controles del randomizer", gameFile: "Archivo del juego", selectFile: "Seleccionar archivo", loadRomHint: "Carga un archivo compatible para empezar",
    autoPatch: "El parche base se detecta y aplica automáticamente.", reproducibleSeed: "Seed reproducible",
    useExistingSeed: "Usar seed existente", applySeed: "Aplicar seed", applySeedHelp: "Lee la seed MXT2 introducida, restaura todas sus opciones y paletas, y comprueba que el paquete no esté corrupto.", seedPlaceholder: "Opcional: pega una seed MXT2",
    randomizeBossWeaknesses: "Randomizar debilidades de jefes", randomizeBossWeaknessesHelp: "Asigna una debilidad a cada jefe y a la cabeza final de Sigma, con da\u00f1o entre 4 y 7. Sortea por separado el ataque normal o cargado que activa la reacci\u00f3n especial. Armadillo conserva la rotura ligada a su debilidad. La l\u00f3gica exige esas armas salvo un jefe inicial con Buster. Desactivado conserva las debilidades originales.",
    domeAlwaysHint: "Las c\u00fapulas de Chill Penguin siempre reciben un arma al azar por seed. La l\u00f3gica exige esa arma para obtener su recompensa; el spoiler indica cu\u00e1l es.",
    options: "Opciones", randomizeItems: "Randomizar objetos", randomizeItemsHelp: "Añade Heart Tanks, Sub Tanks y habilidades de Zero en la pool de objetos. Shotokan puede aparecer como recompensa rara.",
    randomizeArmor: "Randomizar armadura", randomizeArmorHelp: "Mezcla casco, mejora del Buster, cuerpo y botas al pool de objetos",
    randomizeBossRewards: "Randomizar recompensas de jefes", randomizeBossRewardsHelp: "Permite que las ocho armas de jefe aparezcan fuera de su jefe original y formen parte del pool general de recompensas.",
    lockBossAccess: "Bloquear acceso a jefes", lockBossAccessHelp: "Añade llaves de acceso a los jefes como objetos de progresión. Para consultarlas dentro del juego, abre pausa con Select, pulsa Start para mostrarlas y B para volver al menú.",
    showItemTexts: "Mostrar textos de ítems", showItemTextsHelp: "Muestra el nombre abreviado de lo que recoges debajo de la vida, sin detener la partida.",
    requireFullProgression: "Exigir progresión completa", requireFullProgressionHelp: "Exige recorrer y recoger las 20 ubicaciones de objetos y derrotar a los 8 jefes.",
    startingGear: "Equipo inicial", noStartingGear: "Sin equipo", normal: "Normal", generous: "Generoso", custom: "Personalizado",
    generateRom: "Generar y descargar", saveRom: "Guardar", downloadSpoilerLog: "Descargar spoiler log",
    downloadBpsPatch: "Descargar BPS", downloadBpsPatchHelp: "Descarga la randomización generada como parche BPS.",
    downloadBizhawkLua: "Descargar Lua BizHawk", downloadBizhawkLuaHelp: "Descarga el script Lua para usar el tracker con BizHawk.",
    generateSpoilerLog: "Generar spoiler log", generateSpoilerLogHelp: "Al generar el archivo, descarga también un TXT con equipo inicial, recompensas, opciones y esferas de progresión de la seed.",
    customization: "Personalización",
    playerPalette: "Paletas y preview", preset: "Preset", byteValues: "Bytes de paleta", normalPreview: "Vista normal",
    armorPreview: "Vista con armadura", weaponPalettes: "Paletas de armas", weaponPalettesHelp: "Selecciona un arma para editar sus cuatro colores.",
    paletteColors: "Vista de colores", customPreset: "Personalizado",
    color0: "Color 1", color1: "Color 2", color2: "Color 3", color3: "Color 4", lowByte: "byte bajo", highByte: "byte alto", romActions: "Acciones del archivo",
    previewPalettes: "Paletas disponibles", originalXPalette: "X · Color original",
    randomAllPalettes: "Aleatorio · todas las paletas", randomAllPalettesHelp: "Genera paletas sorpresa para X y las ocho armas usando tonos moderados, contraste controlado y colores relacionados para evitar combinaciones molestas a la vista.",
    chaosAllPalettes: "Chaos · todas las paletas", chaosAllPalettesHelp: "Genera paletas sorpresa con valores mucho más libres. Puede producir combinaciones raras, agresivas o de alto contraste que el modo aleatorio normal evita.",
    savePalettes: "Guardar paletas", loadPalettes: "Cargar paletas",
    help: "Ayuda", paletteHelpButtonHelp: "Muestra u oculta una explicación de la personalización de paletas.",
    paletteHelpTitle: "Cómo funciona la personalización",
    paletteHelpTabs: "Cada pestaña conserva una paleta independiente: X sin arma y las ocho armas obtenibles.",
    paletteHelpBytes: "Cada color usa dos valores; cuatro colores forman la paleta completa que se escribirá en el archivo.",
    paletteHelpPresets: "Los presets normales afectan la pestaña seleccionada, ya sea X o un arma. Aleatorio y Chaos reemplazan simultáneamente las nueve paletas y ocultan el resultado en el preview para que sea sorpresa.",
    paletteHelpFiles: "Guardar paletas exporta las nueve en un TXT; Cargar paletas valida ese archivo y restaura todos los cambios.",
    savePalettesHelp: "Exporta los 72 bytes actuales —la paleta de X y las ocho paletas de armas— a un único archivo TXT reutilizable.",
    loadPalettesHelp: "Importa un TXT creado por esta aplicación, valida que contenga exactamente nueve paletas de 8 bytes y restaura todos sus colores.",
    palettePresetHelp: "Aplica un esquema predefinido a la paleta seleccionada. Aleatorio genera colores sorpresa; Chaos usa combinaciones más extremas.",
    xPaletteHelp: "Abre la paleta de colores de X sin arma.",
    weaponPaletteHelp: "Abre la paleta de colores para {weapon}.",
    selectRomHelp: "Selecciona un archivo limpio compatible o uno ya preparado por este randomizer.",
    generateRomHelp: "Genera una distribución válida, aplica las nueve paletas y descarga inmediatamente el archivo. Si la opción de spoiler está activa, descarga también su TXT.",
    invalidPaletteFile: "El archivo no contiene un conjunto válido de nueve paletas.",
    preparingRom: "Preparando archivo", verifyingRom: "Verificando versión y preparación...", cleanRomPatched: "Archivo limpio verificado. Preparación aplicada automáticamente.",
    patchDetected: "Preparación detectada. No se aplicó una segunda vez.", romPrepared: "Archivo preparado", romCompatible: "Archivo compatible",
    romPreparationFailed: "No se pudo verificar o preparar el archivo.",
    romIncompatible: "Archivo incompatible", pasteSeed: "Pega una seed MXT2 para cargar sus ajustes.", seedLoaded: "Seed cargada",
    seedLoadedMessage: "Seed cargada. Los ajustes y paletas fueron restaurados.", invalidSeed: "Seed inválida", loadCompatibleRom: "Carga un archivo compatible antes de generar.",
    error: "Error",
    languageToggle: "English",
    languageToggleHelp: "Cambiar idioma a inglés",
    startNoneHint: "Empieza sin objetos ni mejoras adicionales. Si el acceso a jefes no está bloqueado, sus llaves se conceden automáticamente para evitar softlocks.",
    startNormalHint: "Empieza con 2 objetos de progresión elegidos por la seed para abrir rutas iniciales sin eliminar demasiado descubrimiento. Shotokan puede reemplazar uno de esos objetos muy rara vez.",
    startGenerousHint: "Empieza con 4 objetos y prioriza herramientas útiles para abrir rutas tempranas. Shotokan puede reemplazar uno de esos objetos con una probabilidad baja.",
    startCustomHint: "Usa la selección manual exactamente como fue marcada; solo añade objetos extra cuando sea imprescindible para que la seed pueda completarse.",
  },
  en: {
    disclaimerEyebrow: "Legal notice",
    disclaimerTitle: "Use only your own game copy",
    disclaimerBody: "This tool does not include or provide game files, protected content, BIOS files, graphics, audio, or other proprietary material.",
    disclaimerNoFiles: "You must use a legally obtained copy. By continuing, you confirm that you understand this and are responsible for how you use the tool.",
    acceptDisclaimer: "I understand and continue",
    confirmSelection: "OK",
    palettesSaved: "All nine palettes were saved to a TXT file.",
    palettesLoaded: "All nine palettes were loaded successfully.",
    palettesRandomized: "Random colors were generated for all nine palettes.",
    romNotLoaded: "File not loaded", noSeed: "Not generated", generatedSeed: "Generated seed", seedGeneratedStatus: "Generated",
    controlsLabel: "Randomizer controls", gameFile: "Game file", selectFile: "Select file", loadRomHint: "Load a compatible file to begin",
    autoPatch: "The randomizer setup is detected and applied automatically.", reproducibleSeed: "Reproducible seed",
    useExistingSeed: "Use existing seed", applySeed: "Apply seed", applySeedHelp: "Loads the MXT2 seed, restores its options and palettes, and checks that it can be used.", seedPlaceholder: "Optional: paste an MXT2 seed",
    randomizeBossWeaknesses: "Randomize boss weaknesses", randomizeBossWeaknessesHelp: "Assigns a weakness to each boss and Sigma's final head, with damage from 4 to 7. Separately selects a normal or charged attack for special reactions. Armadillo keeps armor break linked to its weakness. Logic requires these weapons except for one designated Buster starter. Disabled keeps original weaknesses.",
    domeAlwaysHint: "Chill Penguin domes always receive a random weapon per seed. Logic requires that weapon to collect their reward; the spoiler identifies it.",
    options: "Options", randomizeItems: "Randomize items", randomizeItemsHelp: "Adds Heart Tanks, Sub Tanks, and Zero Skills to the items that can be shuffled. Shotokan can appear as a rare reward.",
    randomizeArmor: "Randomize armor", randomizeArmorHelp: "Adds the helmet, Buster upgrade, body, and boots to the items that can be shuffled.",
    randomizeBossRewards: "Randomize boss rewards", randomizeBossRewardsHelp: "Allows all eight boss weapons to appear as rewards outside their original boss.",
    lockBossAccess: "Lock boss access", lockBossAccessHelp: "Adds boss access keys as progression items. To view your keys in-game, open pause with Select, press Start to show them, and B to return to the menu.",
    showItemTexts: "Show item text", showItemTextsHelp: "Shows the abbreviated pickup name below your health without pausing gameplay.",
    requireFullProgression: "Require full progression", requireFullProgressionHelp: "Requires collecting all 20 item locations and defeating all 8 bosses.",
    startingGear: "Starting gear", noStartingGear: "No gear", normal: "Normal", generous: "Generous", custom: "Custom",
    generateRom: "Generate and download", saveRom: "Save", downloadSpoilerLog: "Download spoiler log",
    downloadBpsPatch: "Download BPS", downloadBpsPatchHelp: "Downloads the generated randomization as a BPS patch.",
    downloadBizhawkLua: "Download BizHawk Lua", downloadBizhawkLuaHelp: "Downloads the Lua script used by the BizHawk tracker.",
    generateSpoilerLog: "Generate spoiler log", generateSpoilerLogHelp: "When generating the file, also downloads a TXT file with starting gear, rewards, options, and route details.",
    customization: "Customization",
    playerPalette: "Palettes and preview", preset: "Preset", byteValues: "Color values", normalPreview: "Normal preview",
    armorPreview: "Armored preview", weaponPalettes: "Weapon palettes", weaponPalettesHelp: "Select a weapon to edit its four colors.",
    paletteColors: "Color preview", customPreset: "Custom",
    color0: "Color 1", color1: "Color 2", color2: "Color 3", color3: "Color 4", lowByte: "value A", highByte: "value B", romActions: "File actions",
    previewPalettes: "Available palettes", originalXPalette: "X · Original color",
    randomAllPalettes: "Random · all palettes", randomAllPalettesHelp: "Generates surprise palettes for X and all eight weapons using softer, related colors to avoid harsh combinations.",
    chaosAllPalettes: "Chaos · all palettes", chaosAllPalettesHelp: "Generates surprise palettes with much freer values. It can create odd, aggressive, or high-contrast combinations that normal random mode avoids.",
    savePalettes: "Save palettes", loadPalettes: "Load palettes",
    help: "Help", paletteHelpButtonHelp: "Shows or hides an explanation of palette customization.",
    paletteHelpTitle: "How customization works",
    paletteHelpTabs: "Each tab keeps an independent palette: unarmed X and all eight obtainable weapons.",
    paletteHelpBytes: "Each palette has four colors. These are the colors that will be used in the generated file.",
    paletteHelpPresets: "Regular presets affect the selected tab, either X or a weapon. Random and Chaos change all nine palettes at once and hide the result so it stays a surprise.",
    paletteHelpFiles: "Save palettes puts all nine palettes in one TXT file. Load palettes restores them from that file.",
    savePalettesHelp: "Saves the X palette and all eight weapon palettes into one reusable TXT file.",
    loadPalettesHelp: "Loads a TXT created by this app and restores all nine palettes.",
    palettePresetHelp: "Applies a preset look to the selected palette. Random creates surprise colors; Chaos uses more extreme combinations.",
    xPaletteHelp: "Opens the color palette for X without a weapon.",
    weaponPaletteHelp: "Opens the color palette for {weapon}.",
    selectRomHelp: "Select a compatible clean file, or one already prepared by this randomizer.",
    generateRomHelp: "Generates the file, applies all nine palettes, and downloads it right away. If spoiler log is enabled, its TXT file is downloaded too.",
    invalidPaletteFile: "The file does not contain a valid set of nine palettes.",
    preparingRom: "Preparing file", verifyingRom: "Checking file version and randomizer setup...", cleanRomPatched: "Clean file verified. Randomizer setup applied automatically.",
    patchDetected: "Randomizer setup detected. It was not applied again.", romPrepared: "File prepared", romCompatible: "Compatible file",
    romPreparationFailed: "The file could not be checked or prepared.",
    romIncompatible: "Incompatible file", pasteSeed: "Paste an MXT2 seed to load its settings.", seedLoaded: "Seed loaded",
    seedLoadedMessage: "Seed loaded. Settings and palettes were restored.", invalidSeed: "Invalid seed", loadCompatibleRom: "Load a compatible file before generating.",
    error: "Error",
    languageToggle: "Español",
    languageToggleHelp: "Switch language to Spanish",
    startNoneHint: "Start without extra items or upgrades. If boss access is not locked, boss keys are given automatically to avoid getting stuck.",
    startNormalHint: "Start with 2 seed-chosen items that open early paths without removing too much discovery. Shotokan can very rarely replace one of those items.",
    startGenerousHint: "Start with 4 items and favor useful tools for early paths. Shotokan can replace one of those items at a low rate.",
    startCustomHint: "Uses exactly what you selected; only adds extra items when needed so the seed can be completed.",
  },
});

export const DEFAULT_LOCALE = "en";
const LOCALE_STORAGE_KEY = "megaManXtremeRandomizerLocale";

let currentLocale = readStoredLocale();

function readStoredLocale() {
  try {
    const storedLocale = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return translations[storedLocale] ? storedLocale : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale) {
  currentLocale = translations[locale] ? locale : DEFAULT_LOCALE;
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, currentLocale);
  } catch {
    // Ignore storage failures; the language switch still works for this session.
  }
  return currentLocale;
}

export function t(key, locale = currentLocale) {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export function translateDocument(root = document, locale = currentLocale) {
  root.documentElement?.setAttribute("lang", locale);
  root.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n, locale); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder, locale); });
  root.querySelectorAll("[data-i18n-label]").forEach((element) => { element.setAttribute("aria-label", t(element.dataset.i18nLabel, locale)); });
  root.querySelectorAll("[data-i18n-title]").forEach((element) => { element.title = t(element.dataset.i18nTitle, locale); });
}
