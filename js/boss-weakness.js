// Combat patch v2. Weapon values are reward IDs; attack IDs are a separate namespace.
export const COMBAT_WEAPONS = Object.freeze([
  { value: 0, name: 'Shotgun Ice', normal: 0x0d, charged: 0x15 },
  { value: 1, name: 'Electric Spark', normal: 0x0c, charged: 0x14 },
  { value: 2, name: 'Rolling Shield', normal: 0x0a, charged: 0x12 },
  { value: 3, name: 'Storm Tornado', normal: 0x0b, charged: 0x13 },
  { value: 4, name: 'Silk Shot', normal: 0x09, charged: 0x11 },
  { value: 5, name: 'Spin Wheel', normal: 0x08, charged: 0x10 },
  { value: 6, name: 'Magnet Mine', normal: 0x06, charged: 0x0e },
  { value: 7, name: 'Speed Burner', normal: 0x07, charged: 0x0f },
].map(Object.freeze));

export const COMBAT_BOSSES = Object.freeze([
  { id: 0, name: 'Chill Penguin', profiles: [0x24], vanilla: [7] },
  { id: 1, name: 'Spark Mandrill', profiles: [0x23], vanilla: [0] },
  { id: 2, name: 'Armored Armadillo', profiles: [0x20, 0x21], vanilla: [1] },
  { id: 3, name: 'Storm Eagle', profiles: [0x22], vanilla: [5] },
  { id: 4, name: 'Morph Moth', profiles: [0x16], vanilla: [7, 2] },
  { id: 5, name: 'Wheel Gator', profiles: [0x0f], vanilla: [6] },
  { id: 6, name: 'Magna Centipede', profiles: [0x06], vanilla: [4] },
  { id: 7, name: 'Flame Stag', profiles: [0x0e], vanilla: [3] },
].map(b => Object.freeze({ ...b, profiles: Object.freeze(b.profiles), vanilla: Object.freeze(b.vanilla) })));

const ROWS = [
  [0x24, 0x17522, '010203010101010301010101018001040101010101800101010a01010101040501010101017f'],
  [0x23, 0x174fc, '010203010101010101010101800301010101010180040101010a01010101040401010101017f'],
  [0x20, 0x1748a, '010203010101808080808080038080808080018080808080808080808080040480010101017f'],
  [0x21, 0x174b0, '010203010101010101010101030101010101010104010101010a01010101040401010101017f'],
  [0x22, 0x174d6, '010203010101010103010180010101010401018001010101010a01010101040401010101017f'],
  [0x16, 0x17464, '010203010101010301010301010101040101040101010101010a01010101040401010101017f'],
  [0x0f, 0x17418, '010203010101030180010101010104018001010101010101010a01010101040401010101017f'],
  [0x06, 0x173cc, '010203010101800101030101010180010104010101800101010a03010101040401010101017f'],
  [0x0e, 0x173f2, '010203010101018001010103010101800101010401010101010a01010101040401010101017f'],
  // Final Sigma head: the body/claws and vulnerability windows are not changed.
  [0x1c, 0x1762c, '010202010101808003800380808080800480048080808004800480010101040401010101017f'],
];

// Offset of complete guarded prefix and [operand offset, weapon attack property].
const REACTIONS = [
  [0, 0x26979, 'fa17d3fe0f2804fe0720020610', [[4, 'charged'], [8, 'normal']]],
  [1, 0x2782b, 'fa17d3fe152804fe0d20072e023e0e223600', [[4, 'charged'], [8, 'normal']]],
  [2, 0x2b5a0, 'fa17d3fe0c2804fe142012060e', [[4, 'normal'], [8, 'charged']]],
  [4, 0x3edb3, 'fa17d3fe072807fa17d3fe0f200f', [[4, 'normal'], [11, 'charged']]],
  [6, 0x1e274, 'fa17d3fe112811fe09280dfe1a2809', [[4, 'charged'], [8, 'normal'], [12, 'fragment']]],
  [7, 0x2a9f9, 'fa17d3fe132804fe0b2022', [[4, 'charged'], [8, 'normal']]],
];
const fromHex = hex => Uint8Array.from(hex.match(/../g), b => parseInt(b, 16));

export function createBossWeaknesses(baseSeed, version = 2) {
  if (![1, 2].includes(version)) throw new Error('Unsupported combat version.');
  if (!/^[0-9a-f]{16}$/i.test(baseSeed)) throw new Error('Invalid combat seed.');
  let state = 2166136261;
  for (const c of `${baseSeed.toLowerCase()}:boss-weaknesses:v1`) state = Math.imul(state ^ c.charCodeAt(0), 16777619) >>> 0;
  state ||= 1;
  const random = max => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) % max;
  };
  const mavericks = COMBAT_WEAPONS.map(w => w.value);
  for (let i = mavericks.length - 1; i > 0; i--) {
    const j = random(i + 1); [mavericks[i], mavericks[j]] = [mavericks[j], mavericks[i]];
  }
  const plan = { version, mavericks, sigma: random(8), busterBossId: random(8) };
  if (version === 2) {
    // Draw damage after the old assignment draws, preserving weaknesses/routes.
    plan.damage = Array.from({ length: 9 }, () => {
      const normal = 4 + random(4);
      return { normal, charged: normal + random(8 - normal) };
    });
  }
  return plan;
}

function validatePlan(plan) {
  if (plan === null) return;
  if (![1, 2].includes(plan?.version) || !Array.isArray(plan.mavericks) || plan.mavericks.length !== 8 ||
      new Set(plan.mavericks).size !== 8 || !plan.mavericks.every(v => Number.isInteger(v) && v >= 0 && v < 8) ||
      !Number.isInteger(plan.sigma) || plan.sigma < 0 || plan.sigma > 7 ||
      !Number.isInteger(plan.busterBossId) || plan.busterBossId < 0 || plan.busterBossId > 7) {
    throw new Error('Invalid boss weakness plan.');
  }
  if (plan.version === 2 && (!Array.isArray(plan.damage) || plan.damage.length !== 9 ||
      !plan.damage.every(d => Number.isInteger(d?.normal) && Number.isInteger(d?.charged) &&
        d.normal >= 4 && d.normal <= 7 && d.charged >= d.normal && d.charged <= 7))) {
    throw new Error('Invalid weakness damage: expected 4..7.');
  }
}

function regions(plan) {
  validatePlan(plan);
  const result = ROWS.map(([profile, offset, hex]) => {
    const data = fromHex(hex);
    if (plan) {
      const boss = COMBAT_BOSSES.find(b => b.profiles.includes(profile));
      const weapon = COMBAT_WEAPONS[boss ? plan.mavericks[boss.id] : plan.sigma];
      const damage = plan.version === 1 ? { normal: 3, charged: 4 } : plan.damage[boss ? boss.id : 8];
      if (boss) {
        for (const old of boss.vanilla) {
          const w = COMBAT_WEAPONS[old];
          // Armored Armadillo keeps its original resistance pattern; only the
          // new weakness bypasses armor and starts the original break sequence.
          data[w.normal] = profile === 0x20 ? 0x80 : 1;
          data[w.charged] = profile === 0x20 ? 0x80 : 1;
        }
        if (boss.id === 6) data[0x1a] = 1; // Silk Shot fragment.
      } else {
        // Sigma keeps the original weapon immunities, with exactly one weakness.
        for (const w of COMBAT_WEAPONS) { data[w.normal] = 0x80; data[w.charged] = 0x80; }
      }
      data[weapon.normal] = damage.normal; data[weapon.charged] = damage.charged;
      if (weapon.value === 4) data[0x1a] = damage.normal;
    }
    return { offset, data, profile };
  });
  for (const [boss, offset, hex, operands] of REACTIONS) {
    const data = fromHex(hex);
    if (plan) {
      const w = COMBAT_WEAPONS[plan.mavericks[boss]];
      for (const [index, kind] of operands) data[index] = kind === 'fragment' ? (w.value === 4 ? 0x1a : w.normal) : w[kind];
    }
    result.push({ offset, data });
  }
  return result;
}

// Verify all bytes before making any writes. previousPlan comes from the input
// ROM's seed metadata, so a loaded seed can be rerolled or restored to vanilla.
export function patchBossWeaknesses(rom, plan, previousPlan = null) {
  const before = regions(previousPlan), after = regions(plan);
  if (![0x100000, 0x200000].includes(rom.length)) throw new Error('Unsupported combat ROM size.');
  for (const region of before) {
    for (const alias of rom.length === 0x200000 ? [0, 0x100000] : [0]) {
      if (!region.data.every((b, i) => rom[region.offset + alias + i] === b)) {
        throw new Error(`Unsupported boss combat data at $${(region.offset + alias).toString(16)}.`);
      }
    }
    if (region.profile !== undefined) {
      const ptr = 0x172d2 + region.profile * 2;
      const address = 0x4000 + region.offset % 0x4000;
      if ((rom[ptr] | rom[ptr + 1] << 8) !== address) throw new Error('Unsupported boss damage pointer.');
    }
  }
  for (const region of after) {
    rom.set(region.data, region.offset);
    if (rom.length === 0x200000) rom.set(region.data, region.offset + 0x100000);
  }
  return plan;
}
