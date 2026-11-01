import { WEAPON_PALETTES } from './tables.js?v=full-progression-1';

export const KEY_MENU_HOOK_OFFSET = 0x60260;
export const KEY_MENU_HOOK = Object.freeze([0x3e,0x40,0x21,0,0x40,0xc7,0]);
const SIGNATURE = [0x4d,0x58,0x54,0x4b,16]; // MXTK + format version
const BOSS_ORDER = ['chill_penguin','spark_mandrill','armored_armadillo','storm_eagle',
  'morph_moth','wheel_gator','magna_centipede','flame_stag'];
const matches = (rom,offset,bytes) => bytes.every((value,i)=>rom[offset+i]===value);

export function hasKeyMenu(rom) {
  return rom?.length===0x200000 && rom[0x147]===0x1b && rom[0x148]===6 &&
    matches(rom,KEY_MENU_HOOK_OFFSET,KEY_MENU_HOOK) &&
    matches(rom,0x103ff0,SIGNATURE) && rom[0x103ffe]===0x40 &&
    matches(rom,CAPSULE_DIALOGUE_OFFSET,CAPSULE_DIALOGUE_ORIGINAL) &&
    (hasItemTexts(rom) || hasOriginalNotificationHooks(rom));
}

// Called after all seed/palette/metadata writes and before the global checksum.
export function refreshKeyMenu(rom) {
  if (!hasKeyMenu(rom)) return false;
  for (const [index,id] of BOSS_ORDER.entries()) {
    const weapon=WEAPON_PALETTES.find(entry=>entry.id===id);
    const source=weapon.bank*0x4000+weapon.start-0x4000+4;
    const target=0x100800+Math.floor(index/2)*8+(index%2+1)*2;
    rom.set(rom.subarray(source,source+2),target);
  }
  // Keep the original MBC5 aliases current after reward and palette writes.
  rom.set(rom.subarray(0x4000,0x100000),0x104000);
  return true;
}

// Stage-only call site: starting gear also calls 3F:7B17 and stays silent.
export const REWARD_FRAME_OFFSET = 0xb4c;
export const REWARD_FRAME_STUB_OFFSET = 0x3fa0;
export const REWARD_ORIGINAL_FRAME = [0xf3,0x21,0xff,0xff];
export const REWARD_FRAME_HOOK = [0xcd,0xa0,0x3f,0xf3];
export const REWARD_FRAME_STUB = [0xf3,0x21,0xff,0xff,0xf5,0xfa,0xf3,0xd3,0xe6,0xc0,0xfe,0xc0,0x20,0x19,0xfa,0xf2,0xd3,0xa7,0x20,0x7,0xfa,0xf3,0xd3,0xe6,0x7,0x28,0xc,0xc5,0xd5,0xe5,0x3e,0x40,0x21,0x0,0x5c,0xc7,0xe1,0xd1,0xc1,0xf1,0xf3,0xc9];
export const REWARD_CALL_OFFSET = 0xffc11;
export const REWARD_STUB_OFFSET = 0xffc2a;
export function installRewardNotification(rom) {
  const original = [0xcd,0x17,0x7b];
  const hooked = [0xcd,0x2a,0x7c];
  if (!matches(rom, REWARD_CALL_OFFSET, original) && !matches(rom, REWARD_CALL_OFFSET, hooked)) {
    throw new Error('Unsupported stage reward notification hook.');
  }
  const stub = [0xe5,0x3e,0x40,0x21,0x00,0x50,0xc7,0xe1,0xc9];
  if (!matches(rom, REWARD_STUB_OFFSET, new Array(stub.length).fill(0)) &&
      !matches(rom, REWARD_STUB_OFFSET, stub)) throw new Error('Reward notification stub is occupied.');
  const originalFrame = REWARD_ORIGINAL_FRAME;
  if (!matches(rom, REWARD_FRAME_OFFSET, originalFrame) && !matches(rom, REWARD_FRAME_OFFSET, REWARD_FRAME_HOOK)) {
    throw new Error('Unsupported frame notification hook.');
  }
  if (!matches(rom, REWARD_FRAME_STUB_OFFSET, new Array(REWARD_FRAME_STUB.length).fill(0)) &&
      !matches(rom, REWARD_FRAME_STUB_OFFSET, REWARD_FRAME_STUB)) throw new Error('Frame notification stub is occupied.');
  rom.set(REWARD_FRAME_HOOK, REWARD_FRAME_OFFSET);
  rom.set(REWARD_FRAME_STUB, REWARD_FRAME_STUB_OFFSET);
  rom.set(hooked, REWARD_CALL_OFFSET);
  rom.set(stub, REWARD_STUB_OFFSET);
}

export function hasItemTexts(rom) {
  return matches(rom,REWARD_FRAME_OFFSET,REWARD_FRAME_HOOK) &&
    matches(rom,REWARD_FRAME_STUB_OFFSET,REWARD_FRAME_STUB) &&
    matches(rom,REWARD_CALL_OFFSET,[0xcd,0x2a,0x7c]) &&
    matches(rom,REWARD_STUB_OFFSET,[0xe5,0x3e,0x40,0x21,0x00,0x50,0xc7,0xe1,0xc9]);
}
function hasOriginalNotificationHooks(rom) {
  return matches(rom,REWARD_FRAME_OFFSET,REWARD_ORIGINAL_FRAME) &&
    matches(rom,REWARD_FRAME_STUB_OFFSET,new Array(REWARD_FRAME_STUB.length).fill(0)) &&
    matches(rom,REWARD_CALL_OFFSET,[0xcd,0x17,0x7b]) &&
    matches(rom,REWARD_STUB_OFFSET,new Array(9).fill(0));
}
export function configureItemTexts(rom,enabled) {
  if (enabled) { installRewardNotification(rom); return; }
  if (hasOriginalNotificationHooks(rom)) return;
  const legacyStageOnly = matches(rom,REWARD_FRAME_OFFSET,REWARD_ORIGINAL_FRAME) &&
    matches(rom,REWARD_FRAME_STUB_OFFSET,new Array(REWARD_FRAME_STUB.length).fill(0)) &&
    matches(rom,REWARD_CALL_OFFSET,[0xcd,0x2a,0x7c]) &&
    matches(rom,REWARD_STUB_OFFSET,[0xe5,0x3e,0x40,0x21,0x00,0x50,0xc7,0xe1,0xc9]);
  if (!hasItemTexts(rom) && !legacyStageOnly) throw new Error('Unsupported item text notification hooks.');
  rom.set(REWARD_ORIGINAL_FRAME,REWARD_FRAME_OFFSET);
  rom.fill(0,REWARD_FRAME_STUB_OFFSET,REWARD_FRAME_STUB_OFFSET+REWARD_FRAME_STUB.length);
  rom.set([0xcd,0x17,0x7b],REWARD_CALL_OFFSET);
  rom.fill(0,REWARD_STUB_OFFSET,REWARD_STUB_OFFSET+9);
}

// Require the native Dr. Light conversation in the released base patches.
export const CAPSULE_DIALOGUE_OFFSET = 0x37*0x4000+0x11c7;
export const CAPSULE_DIALOGUE_ORIGINAL = [0x3e,1,0xea,0xa6,0xd3,0xcd,0xf5,0x51];
