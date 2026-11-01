import { ARMOR_PARTS, BOSS_WEAPONS, REWARD_TYPES, SIGMA_KEYS, ZERO_SKILLS } from './tables.js?v=full-progression-1';

const POINTERS = 0x7375c; // 1C:775C, eight native post-boss text pointers.
const START = 0x73ef0, END = 0x73ff0;
const SIGNATURE = [0x4d,0x58,0x42,0x52,1]; // MXBR + format version
const VANILLA_POINTERS = [0x776c,0x7785,0x77a1,0x77bd,0x77d8,0x77ef,0x7807,0x7820];
const KEY_NAMES = ['PENGUIN','MANDRILL','ARMADILLO','EAGLE','MOTH','GATOR','CENTIPEDE','STAG'];

export function bossRewardName(reward) {
  if (reward.type === REWARD_TYPES.HEART_TANK) return 'HEART TANK';
  if (reward.type === REWARD_TYPES.SUB_TANK) return 'SUB TANK';
  if (reward.type === REWARD_TYPES.SHOTOKAN) return 'SHOTOKAN';
  if (reward.type === REWARD_TYPES.BOSS_KEY) {
    if (reward.value === 0xff) return 'ALL BOSS KEYS';
    if (reward.value === 0) return 'NO BOSS KEY';
    const index = KEY_NAMES.findIndex((_,i)=>(1<<i)===reward.value);
    if (index >= 0) return `${KEY_NAMES[index]} KEY`;
  }
  const items = [...ARMOR_PARTS,...BOSS_WEAPONS,...ZERO_SKILLS,...SIGMA_KEYS];
  const match = items.find(r=>r.type===reward.type&&r.value===reward.value);
  if (!match) throw new Error('Unknown boss reward text.');
  return match.label.toUpperCase();
}

export function bossRewardLines(rewards) {
  const names = rewards.map(bossRewardName);
  if (names.length === 0) return ['STAGE CLEAR','NO NEW REWARD'];
  if (names.length === 1) return ['YOU GOT',names[0]];
  if (names.length === 2) return names;
  throw new Error('The native boss reward screen supports two reward lines.');
}

const word = (rom,offset) => rom[offset] | rom[offset+1]<<8;
function knownLayout(rom,alias) {
  if (VANILLA_POINTERS.every((value,i)=>word(rom,alias+POINTERS+i*2)===value)) {
    return rom.subarray(alias+START,alias+END).every(value=>value===0);
  }
  if (!SIGNATURE.every((value,i)=>rom[alias+START+i]===value)) return false;
  for (let i=0;i<8;i++) {
    const pointer = word(rom,alias+POINTERS+i*2);
    let offset = 0x6c000 + pointer, lines=0, columns=0;
    if (offset<START+SIGNATURE.length||offset>=END) return false;
    while (offset<END && lines<2) {
      const value = rom[alias+offset++];
      if (value===0xff) { lines++; columns=0; }
      else if (value>0x3a||++columns>16) return false;
    }
    if (lines!==2) return false;
  }
  return true;
}

export function patchBossRewardText(rom,stageTables) {
  // Prepare everything before touching either alias; never leave a partial patch.
  const data = [...SIGNATURE], pointers=[], screens=[];
  for (let stage=0;stage<8;stage++) {
    const table = stageTables.find(t=>t.stageId===stage);
    const entry = table?.entries.find(e=>e.objectId===0x1e);
    if (!entry) throw new Error(`Missing boss rewards for stage ${stage}.`);
    const lines = bossRewardLines(entry.rewards);
    pointers.push(0x7ef0+data.length);
    for (const line of lines) {
      if (line.length>16||!/^[A-Z0-9 ]+$/.test(line)) throw new Error('Boss reward name exceeds native text limits.');
      data.push(...[...line].map(c=>c.charCodeAt(0)-32),0xff);
    }
    screens.push(lines);
  }
  if (data.length>END-START) throw new Error('Boss reward text exceeds reserved space.');
  const aliases = rom.length===0x200000 ? [0,0x100000] : [0];
  for (const alias of aliases) {
    if (!knownLayout(rom,alias)) throw new Error('Unsupported boss reward text layout.');
  }
  for (const alias of aliases) {
    rom.fill(0,alias+START,alias+END);
    rom.set(data,alias+START);
    pointers.forEach((pointer,i)=>rom.set([pointer&255,pointer>>8],alias+POINTERS+i*2));
  }
  return screens;
}
