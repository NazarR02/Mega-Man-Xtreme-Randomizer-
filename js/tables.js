export const BANK_SIZE = 0x4000;
export const REWARD_BANK = 0x3f;
export const POINTER_TABLE_ADDRESS = 0x7c4f;
export const REWARD_DATA_ADDRESS = 0x7c5f;
export const POINTER_TABLE_SIZE = 16;
export const ROM_SEED_METADATA_BANK = 0x3f;
export const ROM_SEED_METADATA_ADDRESS = 0x7d20;
export const ROM_SEED_METADATA_SIZE = 64;

export const STARTING_TABLE_BANK = 0x15;
export const STARTING_TABLE_ADDRESS = 0x7d81;
export const STARTING_TABLE_END_ADDRESS = 0x7d93;
export const STARTING_TABLE_SIZE = STARTING_TABLE_END_ADDRESS - STARTING_TABLE_ADDRESS;
export const STARTING_TABLE_MAX_ENTRIES = Math.floor((STARTING_TABLE_SIZE - 1) / 2);

export const PALETTE_BANK = 0x15;
export const PALETTE_START_ADDRESS = 0x6d54;
export const PALETTE_SIZE = 8;
export const PALETTE_ADDRESSES = Object.freeze(Array.from({ length: PALETTE_SIZE }, (_, index) => PALETTE_START_ADDRESS + index));

export const WEAPON_PALETTES = Object.freeze([
  { id: "chill_penguin", name: "Chill Penguin", weaponName: "Shotgun Ice", bank: 0x15, start: 0x6d84, end: 0x6d8b, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0x20, 0x7b, 0xa0, 0x18] },
  { id: "spark_mandrill", name: "Spark Mandrill", weaponName: "Electric Spark", bank: 0x15, start: 0x6d7c, end: 0x6d83, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0x9e, 0x27, 0x49, 0x04] },
  { id: "storm_eagle", name: "Storm Eagle", weaponName: "Storm Tornado", bank: 0x15, start: 0x6d8c, end: 0x6d93, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0x5e, 0x75, 0x04, 0x18] },
  { id: "armored_armadillo", name: "Armored Armadillo", weaponName: "Rolling Shield", bank: 0x15, start: 0x6d5c, end: 0x6d63, length: 8, defaultValues: [0x73, 0x46, 0xde, 0x7b, 0x3d, 0x02, 0x8a, 0x00] },
  { id: "wheel_gator", name: "Wheel Gator", weaponName: "Spin Wheel", bank: 0x15, start: 0x6d6c, end: 0x6d73, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0xe0, 0x13, 0xe0, 0x00] },
  { id: "magna_centipede", name: "Magna Centipede", weaponName: "Magnet Mine", bank: 0x15, start: 0x6d74, end: 0x6d7b, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0x10, 0x78, 0x04, 0x10] },
  { id: "morph_moth", name: "Morph Moth", weaponName: "Silk Shot", bank: 0x15, start: 0x6d94, end: 0x6d9b, length: 8, defaultValues: [0x87, 0x31, 0xde, 0x7b, 0x0f, 0x42, 0x42, 0x08] },
  { id: "flame_stag", name: "Flame Stag", weaponName: "Speed Burner", bank: 0x15, start: 0x6d9c, end: 0x6da3, length: 8, defaultValues: [0x73, 0x46, 0xde, 0x7b, 0x1d, 0x01, 0x48, 0x08] },
].map((entry) => Object.freeze({ ...entry, defaultValues: Object.freeze(entry.defaultValues) })));

export const OBJECT_IDS = Object.freeze({
  HEART_TANK: 0x1a,
  SUB_TANK: 0x1b,
  ARMOR_CAPSULE: 0x1c,
  BOSS: 0x1e,
});

export const REWARD_TYPES = Object.freeze({
  HEART_TANK: 0x01,
  SUB_TANK: 0x02,
  ARMOR_PART: 0x03,
  ZERO_SKILL: 0x04,
  BOSS_KEY: 0x05,
  BOSS_WEAPON: 0x06,
  SIGMA_KEY: 0x07,
  SHOTOKAN: 0x08,
});

export const ARMOR_VALUES = Object.freeze({
  HELMET: 0x01,
  ARMS: 0x02,
  BODY: 0x04,
  BOOTS: 0x08,
});

export const WEAPON_VALUES = Object.freeze({
  CHILL_PENGUIN: 0x00,
  SPARK_MANDRILL: 0x01,
  ARMORED_ARMADILLO: 0x02,
  STORM_EAGLE: 0x03,
  MORPH_MOTH: 0x04,
  WHEEL_GATOR: 0x05,
  MAGNA_CENTIPEDE: 0x06,
  FLAME_STAG: 0x07,
});

export const BOSS_KEY_VALUES = Object.freeze([0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]);

export const ARMOR_PARTS = Object.freeze([
  reward("armor", REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.HELMET, "Helmet"),
  reward("armor", REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.ARMS, "Buster Upgrade"),
  reward("armor", REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.BODY, "Body"),
  reward("armor", REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.BOOTS, "Boots"),
]);

export const BOSS_WEAPONS = Object.freeze([
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.CHILL_PENGUIN, "Shotgun Ice"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.SPARK_MANDRILL, "Electric Spark"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.ARMORED_ARMADILLO, "Rolling Shield"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.STORM_EAGLE, "Storm Tornado"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.MORPH_MOTH, "Silk Shot"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.WHEEL_GATOR, "Spin Wheel"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.MAGNA_CENTIPEDE, "Magnet Mine"),
  reward("weapon", REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.FLAME_STAG, "Speed Burner"),
]);

export const ZERO_SKILLS = Object.freeze([
  zeroSkill(0, 0x01, "Zero Skill 1"),
  zeroSkill(1, 0x02, "Zero Skill 2"),
  zeroSkill(2, 0x04, "Zero Skill 3"),
  zeroSkill(3, 0x08, "Zero Skill 4"),
]);

export const SHOTOKAN_REWARD = Object.freeze(
  reward("special", REWARD_TYPES.SHOTOKAN, 0x01, "Shotokan"),
);

export const EXTRA_ITEM_REWARDS = Object.freeze([
  SHOTOKAN_REWARD,
]);

export const SIGMA_KEYS = Object.freeze([
  reward("key", REWARD_TYPES.SIGMA_KEY, 0x01, "Sigma Key 1"),
  reward("key", REWARD_TYPES.SIGMA_KEY, 0x02, "Sigma Key 2"),
]);

export const ALL_BOSS_KEYS_REWARD = Object.freeze(
  reward("key", REWARD_TYPES.BOSS_KEY, 0xff, "All Boss Keys"),
);

export const PALETTE_PRESETS = Object.freeze({
  normal: { label: "Normal", values: [0x73, 0x46, 0xde, 0x7b, 0x00, 0x79, 0x42, 0x08] },
  red: { label: "Red", values: [0x73, 0x46, 0x1f, 0x00, 0x0c, 0x00, 0x42, 0x08] },
  black: { label: "Black", values: [0x73, 0x46, 0x10, 0x42, 0x42, 0x08, 0x42, 0x08] },
  green: { label: "Green", values: [0x73, 0x46, 0xe0, 0x03, 0x00, 0x01, 0x42, 0x08] },
  purple: { label: "Purple", values: [0x73, 0x46, 0x17, 0x64, 0x0c, 0x20, 0x42, 0x08] },
  void_blue: { label: "Void Blue", values: paletteBytes("0000FFFF00980000") },
  ice: { label: "Shotgun Ice", values: paletteBytes("8731DE7B207BA018") },
  electric: { label: "Electric Spark", values: paletteBytes("8731DE7B9E274904") },
  storm: { label: "Storm Tornado", values: paletteBytes("8731DE7B5E750418") },
  rolling_shield: { label: "Rolling Shield", values: paletteBytes("7346DE7B3D028A00") },
  spin_wheel: { label: "Spin Wheel", values: paletteBytes("8731DE7BE013E000") },
  magnet_mine: { label: "Magnet Mine", values: paletteBytes("8731DE7B10780410") },
  silk_shot: { label: "Silk Shot", values: paletteBytes("8731DE7B0F424208") },
  ember: { label: "Speed Burner", values: paletteBytes("7346DE7B1D014808") },
  emerald: { label: "Emerald", values: paletteBytes("7346DE7BE0034002") },
  cobalt: { label: "Cobalt", values: paletteBytes("4120547F22716038") },
  violet: { label: "Violet", values: paletteBytes("7346DE7B5F651042") },
  gold: { label: "Gold", values: paletteBytes("6600BF3FDF020E01") },
});

const HEART_TANKS = Object.freeze(
  Array.from({ length: 8 }, (_, index) =>
    reward("item", REWARD_TYPES.HEART_TANK, index + 1, `Heart Tank ${index + 1}`),
  ),
);

const SUB_TANKS = Object.freeze(
  Array.from({ length: 4 }, (_, index) =>
    reward("item", REWARD_TYPES.SUB_TANK, index + 1, `Sub Tank ${index + 1}`),
  ),
);

export const STAGES = Object.freeze([
  stage(0, "chill-penguin", "Chill Penguin", "Chill", [
    location("chill-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[0], [reqWeapon(WEAPON_VALUES.FLAME_STAG)]),
    location("chill-armor", "Armor", "armor", "armor", OBJECT_IDS.ARMOR_CAPSULE, ARMOR_PARTS[3]),
  ]),
  stage(1, "spark-mandrill", "Spark Mandrill", "Spark", [
    location("spark-sub", "Sub Tank", "item", "sub", OBJECT_IDS.SUB_TANK, SUB_TANKS[0], [reqArmor(ARMOR_VALUES.BOOTS)]),
    location("spark-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[1], [reqArmor(ARMOR_VALUES.BOOTS)]),
    location("spark-armor", "Armor", "armor", "armor", OBJECT_IDS.ARMOR_CAPSULE, ARMOR_PARTS[2], [reqArmor(ARMOR_VALUES.HELMET)]),
  ]),
  stage(2, "armored-armadillo", "Armored Armadillo", "Armadillo", [
    location("armadillo-sub", "Sub Tank", "item", "sub", OBJECT_IDS.SUB_TANK, SUB_TANKS[1]),
    location("armadillo-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[2]),
    location("armadillo-zero", "Zero Skill", "item", "zero", OBJECT_IDS.ARMOR_CAPSULE, ZERO_SKILLS[0]),
  ]),
  stage(3, "storm-eagle", "Storm Eagle", "Storm", [
    location("storm-sub", "Sub Tank", "item", "sub", OBJECT_IDS.SUB_TANK, SUB_TANKS[2]),
    location("storm-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[3]),
    location("storm-armor", "Armor", "armor", "armor", OBJECT_IDS.ARMOR_CAPSULE, ARMOR_PARTS[0]),
  ]),
  stage(4, "morph-moth", "Morph Moth", "Morph", [
    location("morph-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[4]),
    location("morph-zero", "Zero Skill", "item", "zero", OBJECT_IDS.ARMOR_CAPSULE, ZERO_SKILLS[1], [reqWeapon(WEAPON_VALUES.WHEEL_GATOR)]),
  ]),
  stage(5, "wheel-gator", "Wheel Gator", "Wheel", [
    location("wheel-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[5], [reqWeapon(WEAPON_VALUES.FLAME_STAG), reqArmor(ARMOR_VALUES.ARMS)]),
    location("wheel-zero", "Zero Skill", "item", "zero", OBJECT_IDS.ARMOR_CAPSULE, ZERO_SKILLS[2], [reqArmor(ARMOR_VALUES.BOOTS)]),
  ]),
  stage(6, "magna-centipede", "Magna Centipede", "Magna", [
    location("magna-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[6], [reqWeapon(WEAPON_VALUES.FLAME_STAG), reqArmor(ARMOR_VALUES.ARMS)]),
    location("magna-sub", "Sub Tank", "item", "sub", OBJECT_IDS.SUB_TANK, SUB_TANKS[3], [reqWeapon(WEAPON_VALUES.FLAME_STAG), reqArmor(ARMOR_VALUES.ARMS)]),
    location("magna-zero", "Zero Skill", "item", "zero", OBJECT_IDS.ARMOR_CAPSULE, ZERO_SKILLS[3], [reqArmor(ARMOR_VALUES.HELMET)]),
  ]),
  stage(7, "flame-stag", "Flame Stag", "Flame", [
    location("flame-heart", "Heart Tank", "item", "heart", OBJECT_IDS.HEART_TANK, HEART_TANKS[7]),
    location("flame-armor", "Armor", "armor", "armor", OBJECT_IDS.ARMOR_CAPSULE, ARMOR_PARTS[1]),
  ]),
]);

const STARTING_GEAR_GROUPS = Object.freeze([
  { key: "armor", label: "Armor", items: ARMOR_PARTS },
  { key: "weapons", label: "Boss Weapons", items: BOSS_WEAPONS },
  { key: "zero", label: "Zero Skills", items: ZERO_SKILLS },
]);

export function getAllLocations() {
  return STAGES.flatMap((stageEntry) =>
    stageEntry.locations.map((locationEntry) => ({
      ...locationEntry,
      stageId: stageEntry.id,
      stageName: stageEntry.name,
    })),
  );
}

export function getBossKeys() {
  return STAGES.map((stageEntry) =>
    reward("key", REWARD_TYPES.BOSS_KEY, stageEntry.boss.requiredKeyMask, `Boss Key: ${stageEntry.shortName} ${hexByte(stageEntry.boss.requiredKeyMask)}`),
  );
}

export function getStartingGearGroups() {
  return STARTING_GEAR_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    items: group.items.map(cloneReward),
  }));
}

export function getAutomaticStartingPool() {
  return [...ARMOR_PARTS, ...BOSS_WEAPONS].map(cloneReward);
}

export function getGenerousPriorityPool() {
  return [
    findReward(REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.BOOTS),
    findReward(REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.HELMET),
    findReward(REWARD_TYPES.ARMOR_PART, ARMOR_VALUES.ARMS),
    findReward(REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.FLAME_STAG),
    findReward(REWARD_TYPES.BOSS_WEAPON, WEAPON_VALUES.WHEEL_GATOR),
  ].map(cloneReward);
}

export function findStartingRewardById(id) {
  for (const group of STARTING_GEAR_GROUPS) {
    const match = group.items.find((item) => item.id === id);
    if (match) return cloneReward(match);
  }
  return null;
}

export function cloneReward(rewardEntry) {
  return { ...rewardEntry };
}

export function createFillerReward(rng, existingRewards = [], excludedRewards = []) {
  const excluded = new Set(excludedRewards.map(rewardKey));
  const counts = new Map();
  let heartTankCount = 0;

  for (const item of existingRewards) {
    const key = rewardKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (item.type === REWARD_TYPES.HEART_TANK) heartTankCount += 1;
  }

  const candidates = [...HEART_TANKS, ...SUB_TANKS].filter((item) => {
    if (excluded.has(rewardKey(item))) return false;
    return item.type !== REWARD_TYPES.HEART_TANK || heartTankCount < HEART_TANKS.length;
  });
  if (candidates.length === 0) throw new Error("No filler rewards are available.");

  const unused = candidates.filter((item) => !counts.has(rewardKey(item)));
  const minimum = Math.min(...candidates.map((item) => counts.get(rewardKey(item)) ?? 0));
  const pool = unused.length > 0
    ? unused
    : candidates.filter((item) => (counts.get(rewardKey(item)) ?? 0) === minimum);

  return cloneReward(pool[Math.floor(rng() * pool.length)]);
}

export function isValidBossKeyValue(value) {
  return Number.isInteger(value) && value >= 0x00 && value <= 0xff && (value === 0xff || BOSS_KEY_VALUES.includes(value));
}

export function rewardKey(rewardEntry) {
  return `${rewardEntry.type}:${rewardEntry.value}`;
}

function stage(id, key, name, shortName, locations) {
  return Object.freeze({ id, key, name, shortName, locations: Object.freeze(locations), boss: boss(id) });
}

function location(id, name, group, itemKind, objectId, vanillaReward, requirements = []) {
  return Object.freeze({ id, name, group, itemKind, objectId, vanillaReward, requirements: Object.freeze(requirements) });
}

function boss(stageId) {
  return Object.freeze({
    id: `boss-${stageId}`,
    name: "Boss",
    objectId: OBJECT_IDS.BOSS,
    requiredKeyMask: BOSS_KEY_VALUES[stageId],
    vanillaReward: BOSS_WEAPONS[stageId],
  });
}

function reqArmor(value) {
  return Object.freeze({ kind: "armor", value });
}

function reqWeapon(value) {
  return Object.freeze({ kind: "weapon", value });
}

function findReward(type, value) {
  const match = [...ARMOR_PARTS, ...BOSS_WEAPONS, ...ZERO_SKILLS, SHOTOKAN_REWARD].find((item) => item.type === type && item.value === value);
  if (!match) throw new Error(`Reward not found: ${type}:${value}`);
  return match;
}

function reward(kind, type, value, label) {
  return Object.freeze({ id: `${kind}-${value}`, kind, type, value, label });
}

function zeroSkill(index, value, label) {
  return Object.freeze({ id: `zero-${index}`, kind: "zero", type: REWARD_TYPES.ZERO_SKILL, value, label });
}

function hexByte(value) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function paletteBytes(hex) {
  if (!/^[0-9a-fA-F]{16}$/.test(hex)) throw new Error(`Invalid palette preset: ${hex}`);
  return Object.freeze(Array.from({ length: 8 }, (_, index) => Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)));
}
