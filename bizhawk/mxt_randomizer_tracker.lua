-- Mega Man Xtreme Randomizer bridge for BizHawk + tracker.html.
-- Run this in BizHawk's Lua Console, then open tracker.html in a browser.

local STATE_WRITE_INTERVAL = 6
local MAX_NOTIFICATION_EVENTS = 24
local BASE_HEALTH = 0x10
local MAX_HEART_TANKS = 8
local LOAD_SYNC_EVENT_THRESHOLD = 3
local RESYNC_CONFIRM_FRAMES = 60

local ADDR = {
  armor = 0xD383,
  hearts = 0xD384,
  shotokan = 0xD3C7,
  zero_skills = 0xD3A0,
  sub_tanks = { 0xD368, 0xD369, 0xD36A, 0xD36B },
  boss_keys = 0xD3E2,
  sigma_keys = 0xD3E3,
  weapons = {
    shotgun_ice = 0xD36E,
    electric_spark = 0xD370,
    rolling_shield = 0xD372,
    storm_tornado = 0xD374,
    speed_burner = 0xD376,
    silk_shot = 0xD378,
    magnet_mine = 0xD37A,
    spin_wheel = 0xD37C,
  },
}

local ARMOR_ITEMS = {
  { key = "head", bit = 0x01, label = "Head Part" },
  { key = "arms", bit = 0x02, label = "Arm Part" },
  { key = "body", bit = 0x04, label = "Body Part" },
  { key = "boots", bit = 0x08, label = "Foot Part" },
}

local WEAPON_ITEMS = {
  { key = "shotgun_ice", label = "Shotgun Ice" },
  { key = "electric_spark", label = "Electric Spark" },
  { key = "rolling_shield", label = "Rolling Shield" },
  { key = "storm_tornado", label = "Storm Tornado" },
  { key = "speed_burner", label = "Speed Burner" },
  { key = "silk_shot", label = "Silk Shot" },
  { key = "magnet_mine", label = "Magnet Mine" },
  { key = "spin_wheel", label = "Spin Wheel" },
}

local BOSS_KEY_ITEMS = {
  { bit = 0x01, label = "Chill Penguin Key" },
  { bit = 0x02, label = "Spark Mandrill Key" },
  { bit = 0x04, label = "Armored Armadillo Key" },
  { bit = 0x08, label = "Storm Eagle Key" },
  { bit = 0x10, label = "Morph Moth Key" },
  { bit = 0x20, label = "Wheel Gator Key" },
  { bit = 0x40, label = "Magna Centipede Key" },
  { bit = 0x80, label = "Flame Stag Key" },
}

local SIGMA_KEY_ITEMS = {
  { bit = 0x01, label = "Sigma Key 1" },
  { bit = 0x02, label = "Sigma Key 2" },
}

local ZERO_SKILL_ITEMS = {
  { bit = 0x01, label = "Zero Skill 1" },
  { bit = 0x02, label = "Zero Skill 2" },
  { bit = 0x04, label = "Zero Skill 3" },
  { bit = 0x08, label = "Zero Skill 4" },
}

local SHOTOKAN_ITEM = { bit = 0x01, label = "Shotokan" }

local function script_dir()
  local source = debug.getinfo(1, "S").source
  local path = source:sub(1, 1) == "@" and source:sub(2) or source
  return path:match("^(.*[\\/])") or ""
end

local STATE_PATH = script_dir() .. "state.js"
local TEMP_STATE_PATH = STATE_PATH .. ".tmp"
local heart_slots = { false, false, false, false, false, false, false, false }
local acquired = {
  armor = 0,
  heart_count = 0,
  boss_keys = 0,
  sigma_keys = 0,
  zero_skills = 0,
  shotokan = false,
  sub_tanks = { false, false, false, false },
  weapons = {},
}

math.randomseed((os.time() or 1) + (emu.framecount() or 0))
local SESSION_ID = math.floor(((os.time() or 1) * 1000 + (emu.framecount() or 0)) % 2147483647)
local pending_resync_signature = nil
local pending_resync_frames = 0

local function has_bit(value, bit_value)
  return ((value or 0) & bit_value) ~= 0
end

local function clamp(value, min_value, max_value)
  if value < min_value then return min_value end
  if value > max_value then return max_value end
  return value
end

local function read_u8(address)
  local ok, value = pcall(memory.read_u8, address, "System Bus")
  if ok and type(value) == "number" then return value end

  ok, value = pcall(memory.readbyte, address, "System Bus")
  if ok and type(value) == "number" then return value end

  if address >= 0xC000 and address <= 0xDFFF then
    local wram_address = address - 0xC000
    ok, value = pcall(memory.read_u8, wram_address, "WRAM")
    if ok and type(value) == "number" then return value end

    ok, value = pcall(memory.readbyte, wram_address, "WRAM")
    if ok and type(value) == "number" then return value end
  end

  return nil
end

local function bool_text(value)
  return value and "true" or "false"
end

local function push_notification(queue, label)
  queue[#queue + 1] = label
end

local function heart_tank_count_from_health(value)
  return clamp(math.floor(((value or BASE_HEALTH) - BASE_HEALTH) / 2), 0, MAX_HEART_TANKS)
end

local function copy_heart_slots()
  local copy = {}
  for index = 1, MAX_HEART_TANKS do
    copy[index] = heart_slots[index] == true
  end
  return copy
end

local function lit_heart_count()
  local count = 0
  for index = 1, MAX_HEART_TANKS do
    if heart_slots[index] then count = count + 1 end
  end
  return count
end

local function clear_heart_slots()
  for index = 1, MAX_HEART_TANKS do
    heart_slots[index] = false
  end
end

local function light_random_heart_slot()
  local candidates = {}
  for index = 1, MAX_HEART_TANKS do
    if not heart_slots[index] then
      candidates[#candidates + 1] = index
    end
  end

  if #candidates == 0 then return false end

  local slot = candidates[math.random(#candidates)]
  heart_slots[slot] = true
  return true
end

local function set_heart_slot_count(target_count, queue)
  target_count = clamp(target_count, 0, MAX_HEART_TANKS)
  local current_count = lit_heart_count()

  if target_count <= current_count then return end

  while current_count < target_count do
    if not light_random_heart_slot() then return end
    current_count = current_count + 1
    if queue then
      push_notification(queue, "Heart Tank")
    end
  end
end

local function empty_state()
  local weapons = {}
  for _, item in ipairs(WEAPON_ITEMS) do
    weapons[item.key] = false
  end

  local sub_tanks = {}
  for index = 1, 4 do
    sub_tanks[index] = false
  end

  local hearts = {}
  for index = 1, MAX_HEART_TANKS do
    hearts[index] = false
  end

  return {
    session_id = 0,
    frame = 0,
    armor = 0,
    heart_count = 0,
    hearts = hearts,
    sub_tanks = sub_tanks,
    weapons = weapons,
    boss_keys = 0,
    sigma_keys = 0,
    zero_skills = 0,
    shotokan = false,
  }
end

local function read_raw_state()
  local weapons = {}
  for _, item in ipairs(WEAPON_ITEMS) do
    local value = read_u8(ADDR.weapons[item.key])
    if value == nil then return nil end
    weapons[item.key] = value ~= 0
  end

  local sub_tanks = {}
  for index, address in ipairs(ADDR.sub_tanks) do
    local value = read_u8(address)
    if value == nil then return nil end
    sub_tanks[index] = value ~= 0
  end

  local armor = read_u8(ADDR.armor)
  local hearts = read_u8(ADDR.hearts)
  local boss_keys = read_u8(ADDR.boss_keys)
  local sigma_keys = read_u8(ADDR.sigma_keys)
  local zero_skills = read_u8(ADDR.zero_skills)
  local shotokan = read_u8(ADDR.shotokan)
  if armor == nil or hearts == nil or boss_keys == nil or sigma_keys == nil or zero_skills == nil or shotokan == nil then
    return nil
  end

  return {
    armor = armor,
    heart_count = heart_tank_count_from_health(hearts),
    sub_tanks = sub_tanks,
    weapons = weapons,
    boss_keys = boss_keys,
    sigma_keys = sigma_keys,
    zero_skills = zero_skills,
    shotokan = has_bit(shotokan, SHOTOKAN_ITEM.bit),
  }
end

local function sync_acquired_from_raw(raw)
  local previous_heart_slots = lit_heart_count()

  acquired.armor = raw.armor
  acquired.heart_count = raw.heart_count
  acquired.boss_keys = raw.boss_keys
  acquired.sigma_keys = raw.sigma_keys
  acquired.zero_skills = raw.zero_skills
  acquired.shotokan = raw.shotokan == true

  for index = 1, 4 do
    acquired.sub_tanks[index] = raw.sub_tanks[index] == true
  end

  for _, item in ipairs(WEAPON_ITEMS) do
    acquired.weapons[item.key] = raw.weapons[item.key] == true
  end

  if acquired.heart_count ~= previous_heart_slots then
    clear_heart_slots()
    set_heart_slot_count(acquired.heart_count, nil)
  end
end

local function raw_loses_persistent_inventory(raw)
  if not raw then return false end
  if raw.heart_count < acquired.heart_count then return true end
  if (raw.armor & acquired.armor) ~= acquired.armor then return true end
  if (raw.boss_keys & acquired.boss_keys) ~= acquired.boss_keys then return true end
  if (raw.sigma_keys & acquired.sigma_keys) ~= acquired.sigma_keys then return true end
  if (raw.zero_skills & acquired.zero_skills) ~= acquired.zero_skills then return true end
  if acquired.shotokan and not raw.shotokan then return true end
  for _, item in ipairs(WEAPON_ITEMS) do
    if acquired.weapons[item.key] and not raw.weapons[item.key] then return true end
  end
  for index = 1, 4 do
    if acquired.sub_tanks[index] and not raw.sub_tanks[index] then return true end
  end
  return false
end

local function raw_persistent_signature(raw)
  local parts = {
    raw.heart_count,
    raw.armor,
    raw.boss_keys,
    raw.sigma_keys,
    raw.zero_skills,
    raw.shotokan and 1 or 0,
  }

  for index = 1, 4 do
    parts[#parts + 1] = raw.sub_tanks[index] and 1 or 0
  end

  for _, item in ipairs(WEAPON_ITEMS) do
    parts[#parts + 1] = raw.weapons[item.key] and 1 or 0
  end

  return table.concat(parts, ":")
end

local function latch_raw_state(raw)
  for _, item in ipairs(WEAPON_ITEMS) do
    if raw.weapons[item.key] then
      acquired.weapons[item.key] = true
    end
  end

  for index = 1, 4 do
    if raw.sub_tanks[index] then
      acquired.sub_tanks[index] = true
    end
  end

  if raw.heart_count > acquired.heart_count then
    acquired.heart_count = raw.heart_count
  end

  acquired.armor = acquired.armor | raw.armor
  acquired.boss_keys = acquired.boss_keys | raw.boss_keys
  acquired.sigma_keys = acquired.sigma_keys | raw.sigma_keys
  acquired.zero_skills = acquired.zero_skills | raw.zero_skills
  if raw.shotokan then acquired.shotokan = true end
end

local function state_from_acquired()
  local weapons = {}
  for _, item in ipairs(WEAPON_ITEMS) do
    weapons[item.key] = acquired.weapons[item.key] == true
  end

  local sub_tanks = {}
  for index = 1, 4 do
    sub_tanks[index] = acquired.sub_tanks[index] == true
  end

  return {
    session_id = SESSION_ID,
    frame = emu.framecount(),
    armor = acquired.armor,
    heart_count = acquired.heart_count,
    hearts = copy_heart_slots(),
    sub_tanks = sub_tanks,
    weapons = weapons,
    boss_keys = acquired.boss_keys,
    sigma_keys = acquired.sigma_keys,
    zero_skills = acquired.zero_skills,
    shotokan = acquired.shotokan == true,
  }
end

local function current_state()
  local raw = read_raw_state()
  if not raw then return state_from_acquired(), false end
  local resynced = false

  if raw_loses_persistent_inventory(raw) then
    local signature = raw_persistent_signature(raw)
    if signature == pending_resync_signature then
      pending_resync_frames = pending_resync_frames + 1
    else
      pending_resync_signature = signature
      pending_resync_frames = 1
    end

    if pending_resync_frames >= RESYNC_CONFIRM_FRAMES then
      sync_acquired_from_raw(raw)
      pending_resync_signature = nil
      pending_resync_frames = 0
      resynced = true
    else
      return state_from_acquired(), false
    end
  else
    pending_resync_signature = nil
    pending_resync_frames = 0
    latch_raw_state(raw)
  end

  return state_from_acquired(), resynced
end

local function encode_state(state, events)
  local weapon_parts = {}
  for _, item in ipairs(WEAPON_ITEMS) do
    weapon_parts[#weapon_parts + 1] = string.format("%q:%s", item.key, bool_text(state.weapons[item.key]))
  end

  local sub_parts = {}
  for index = 1, 4 do
    sub_parts[#sub_parts + 1] = bool_text(state.sub_tanks[index])
  end

  local heart_parts = {}
  for index = 1, MAX_HEART_TANKS do
    heart_parts[#heart_parts + 1] = bool_text(state.hearts[index])
  end

  local event_parts = {}
  for _, event in ipairs(events) do
    event_parts[#event_parts + 1] = string.format("{id:%d,label:%q}", event.id, event.label)
  end

  return table.concat({
    "window.MXT_STATE={",
    string.format("sessionId:%d,", state.session_id or SESSION_ID),
    string.format("frame:%d,", state.frame),
    string.format("armor:%d,", state.armor),
    string.format("heartCount:%d,", state.heart_count),
    string.format("hearts:[%s],", table.concat(heart_parts, ",")),
    string.format("subTanks:[%s],", table.concat(sub_parts, ",")),
    string.format("weapons:{%s},", table.concat(weapon_parts, ",")),
    string.format("bossKeys:%d,", state.boss_keys),
    string.format("sigmaKeys:%d,", state.sigma_keys),
    string.format("zeroSkills:%d,", state.zero_skills),
    string.format("shotokan:%s,", bool_text(state.shotokan)),
    string.format("notifications:[%s]", table.concat(event_parts, ",")),
    "};\n",
  })
end

local function write_state(state, events)
  local file = io.open(TEMP_STATE_PATH, "w")
  if not file then return end
  local ok = file:write(encode_state(state, events))
  file:flush()
  file:close()
  if not ok then
    os.remove(TEMP_STATE_PATH)
    return
  end

  if os.rename(TEMP_STATE_PATH, STATE_PATH) then return end
  os.remove(STATE_PATH)
  os.rename(TEMP_STATE_PATH, STATE_PATH)
end

local function reset_exported_state()
  write_state(empty_state(), {})
end

if event and event.onexit then
  event.onexit(reset_exported_state)
end

local function state_signature(state)
  local parts = {
    state.armor,
    state.heart_count,
    state.boss_keys,
    state.sigma_keys,
    state.zero_skills,
    state.shotokan and 1 or 0,
  }

  for index = 1, MAX_HEART_TANKS do
    parts[#parts + 1] = state.hearts[index] and 1 or 0
  end

  for index = 1, 4 do
    parts[#parts + 1] = state.sub_tanks[index] and 1 or 0
  end

  for _, item in ipairs(WEAPON_ITEMS) do
    parts[#parts + 1] = state.weapons[item.key] and 1 or 0
  end

  return table.concat(parts, ":")
end

local function append_notification_events(log, queue, next_id)
  while #queue > 0 do
    log[#log + 1] = {
      id = next_id,
      label = table.remove(queue, 1),
    }
    next_id = next_id + 1
  end

  while #log > MAX_NOTIFICATION_EVENTS do
    table.remove(log, 1)
  end

  return next_id
end

local function detect_notifications(previous, state, queue)
  for _, item in ipairs(ARMOR_ITEMS) do
    if has_bit(state.armor, item.bit) and not has_bit(previous.armor, item.bit) then
      push_notification(queue, item.label)
    end
  end

  if state.heart_count ~= previous.heart_count then
    set_heart_slot_count(state.heart_count, state.heart_count > previous.heart_count and queue or nil)
    state.hearts = copy_heart_slots()
  end

  for index = 1, 4 do
    if state.sub_tanks[index] and not previous.sub_tanks[index] then
      push_notification(queue, "Sub Tank " .. index)
    end
  end

  for _, item in ipairs(WEAPON_ITEMS) do
    if state.weapons[item.key] and not previous.weapons[item.key] then
      push_notification(queue, item.label)
    end
  end

  for _, item in ipairs(BOSS_KEY_ITEMS) do
    if has_bit(state.boss_keys, item.bit) and not has_bit(previous.boss_keys, item.bit) then
      push_notification(queue, item.label)
    end
  end

  for _, item in ipairs(SIGMA_KEY_ITEMS) do
    if has_bit(state.sigma_keys, item.bit) and not has_bit(previous.sigma_keys, item.bit) then
      push_notification(queue, item.label)
    end
  end

  for _, item in ipairs(ZERO_SKILL_ITEMS) do
    if has_bit(state.zero_skills, item.bit) and not has_bit(previous.zero_skills, item.bit) then
      push_notification(queue, item.label)
    end
  end

  if state.shotokan and not previous.shotokan then
    push_notification(queue, SHOTOKAN_ITEM.label)
  end
end

local initial_raw_state = read_raw_state()
if initial_raw_state then sync_acquired_from_raw(initial_raw_state) end

local previous_state = current_state()
local previous_signature = state_signature(previous_state)
local queue = {}
local notification_events = {}
local next_notification_id = 1
local frame = 0

write_state(previous_state, notification_events)

while true do
  frame = frame + 1
  local state, resynced = current_state()
  local signature = state_signature(state)
  local changed = signature ~= previous_signature

  if resynced then
    queue = {}
    notification_events = {}
    previous_state = state
    previous_signature = signature
    write_state(state, notification_events)
  elseif changed then
    local queue_count_before = #queue
    detect_notifications(previous_state, state, queue)
    local new_notification_count = #queue - queue_count_before

    if new_notification_count > LOAD_SYNC_EVENT_THRESHOLD then
      queue = {}
      notification_events = {}
    else
      next_notification_id = append_notification_events(notification_events, queue, next_notification_id)
    end

    previous_state = state
    previous_signature = state_signature(state)
  end

  if frame % STATE_WRITE_INTERVAL == 0 or changed or resynced then
    write_state(state, notification_events)
  end

  emu.frameadvance()
end
