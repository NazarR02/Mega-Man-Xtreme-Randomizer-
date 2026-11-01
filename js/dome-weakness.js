import { COMBAT_WEAPONS } from './boss-weakness.js?v=3';

export const DOME_PROFILE_OFFSET = 0x17710;
export const DOME_VANILLA = Uint8Array.from(
  '8080808004808004808080808080800480808080808080808080808080800480808080808080'
    .match(/../g), byte => parseInt(byte, 16));

export function createDomeWeapon(baseSeed) {
  if (!/^[0-9a-f]{16}$/i.test(baseSeed)) throw new Error('Invalid dome seed.');
  let hash = 2166136261;
  for (const c of `${baseSeed.toLowerCase()}:penguin-domes:v1`) {
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  return hash % COMBAT_WEAPONS.length;
}

function profile(weaponValue) {
  const weapon = COMBAT_WEAPONS.find(w => w.value === weaponValue);
  if (!weapon) throw new Error('Invalid dome weapon.');
  const row = new Uint8Array(DOME_VANILLA);
  row[0x07] = row[0x0f] = 0x80;
  row[weapon.normal] = row[weapon.charged] = 4;
  return row;
}

export function patchDomeWeakness(rom, weaponValue, previousWeapon = 7) {
  const expected = profile(previousWeapon), replacement = profile(weaponValue);
  const offsets = [DOME_PROFILE_OFFSET];
  if (rom.length === 0x200000) offsets.push(DOME_PROFILE_OFFSET + 0x100000);
  for (const offset of offsets) {
    if (!expected.every((value, i) => rom[offset + i] === value)) {
      throw new Error('Unsupported dome damage profile.');
    }
  }
  for (const offset of offsets) rom.set(replacement, offset);
}

// Replace only the dome gate. Other Speed Burner requirements are independent.
export function getLocationRequirements(location, plan) {
  return location.id === 'chill-heart'
    ? [{ kind: 'weapon', value: plan?.domeWeapon ?? 7 }]
    : location.requirements;
}
