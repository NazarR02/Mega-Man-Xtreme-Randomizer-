import { getLocationRequirements } from './dome-weakness.js?v=1';
import {
  ARMOR_PARTS,
  BOSS_WEAPONS,
  REWARD_TYPES,
  SIGMA_KEYS,
  STAGES,
  ZERO_SKILLS,
  cloneReward,
  getBossKeys,
  rewardKey,
} from "./tables.js?v=full-progression-1";

export function validateProgression(plan, options, startingRewards = []) {
  const state = createState();
  const collectedLocations = new Set();
  const defeatedBosses = new Set();
  const spheres = [];

  collectRewards(startingRewards, state);

  for (let sphere = 0; sphere < 64; sphere += 1) {
    const sphereActions = [];
    let collectedAny = false;

    for (const stage of STAGES) {
      for (const location of stage.locations) {
        const locationKey = `${stage.id}:${location.id}`;
        if (collectedLocations.has(locationKey) || !canCollectLocation(location, state, plan)) continue;

        const rewards = plan.locationRewards.get(location.id) ?? [];
        if (hasRouteProgressionReward(rewards, state, options, plan, collectedLocations)) {
          sphereActions.push(`${stage.name} - ${location.name}`);
        }
        collectRewards(rewards, state);
        collectedLocations.add(locationKey);
        collectedAny = true;
      }

      if (!defeatedBosses.has(stage.id) && canFightBoss(stage, state, options, plan)) {
        const rewards = plan.bossRewards.get(stage.id) ?? [];
        if (hasRouteProgressionReward(rewards, state, options, plan, collectedLocations)) {
          sphereActions.push(`${stage.name} - Boss`);
        }
        collectRewards(rewards, state);
        defeatedBosses.add(stage.id);
        state.defeatedBosses.add(stage.id);
        collectedAny = true;
      }
    }

    if (sphereActions.length > 0) spheres.push(sphereActions);
    if (!collectedAny) break;
  }

  const totalLocations = STAGES.reduce((total, stage) => total + stage.locations.length, 0);
  const missing = getMissingProgression(state, options);
  const sigmaWeaponAvailable = !options.randomizeBossWeaknesses ||
    state.weapons.has(plan.bossWeaknesses.sigma);
  const finalReached = SIGMA_KEYS.every((key) => state.sigmaKeys.has(key.value)) && sigmaWeaponAvailable;
  if (!sigmaWeaponAvailable) missing.push(`Sigma weakness: ${BOSS_WEAPONS.find(w => w.value === plan.bossWeaknesses.sigma).label}`);
  const allBossesDefeated = STAGES.every((stage) => defeatedBosses.has(stage.id));
  const allLocationsCollected = collectedLocations.size === totalLocations;
  const blockingRewards = getBlockingRewards(plan, state, collectedLocations, defeatedBosses, options);
  const fullProgressionComplete = missing.length === 0;
  const valid = finalReached &&
    missing.length === 0 &&
    (!options.requireFullProgression || (
      fullProgressionComplete &&
      allBossesDefeated &&
      allLocationsCollected
    ));

  return {
    valid,
    finalReached,
    allBossesDefeated,
    allLocationsCollected,
    missing,
    blockingRewards,
    spheres,
    collectedLocations: collectedLocations.size,
    totalLocations,
    defeatedBosses: defeatedBosses.size,
    state,
  };
}

function createState() {
  return {
    items: new Set(),
    armorMask: 0,
    zeroSkills: new Set(),
    shotokan: false,
    weapons: new Set(),
    bossKeyMask: 0,
    sigmaKeys: new Set(),
    defeatedBosses: new Set(),
  };
}

function canCollectLocation(location, state, plan) {
  return getLocationRequirements(location, plan).every((requirement) => hasRequirement(requirement, state));
}

function hasRequirement(requirement, state) {
  if (requirement.kind === "armor") return (state.armorMask & requirement.value) === requirement.value;
  if (requirement.kind === "weapon") return state.weapons.has(requirement.value);
  if (requirement.kind === "bossDefeated") return state.defeatedBosses.has(requirement.value);
  return true;
}

function canFightBoss(stage, state, options, plan) {
  if (options.lockBossAccess && (state.bossKeyMask & stage.boss.requiredKeyMask) !== stage.boss.requiredKeyMask) return false;
  if (!options.randomizeBossWeaknesses) return true;
  return stage.id === plan.bossWeaknesses.busterBossId || state.weapons.has(plan.bossWeaknesses.mavericks[stage.id]);
}

function collectRewards(rewards, state) {
  for (const reward of rewards) {
    if (reward.type === REWARD_TYPES.HEART_TANK || reward.type === REWARD_TYPES.SUB_TANK) {
      state.items.add(reward.id);
    } else if (reward.type === REWARD_TYPES.ARMOR_PART) {
      state.armorMask |= reward.value;
    } else if (reward.type === REWARD_TYPES.ZERO_SKILL) {
      if (reward.value === 0xff) ZERO_SKILLS.forEach((item) => state.zeroSkills.add(item.value));
      else state.zeroSkills.add(reward.value);
    } else if (reward.type === REWARD_TYPES.SHOTOKAN) {
      state.shotokan = true;
    } else if (reward.type === REWARD_TYPES.BOSS_WEAPON) {
      state.weapons.add(reward.value);
    } else if (reward.type === REWARD_TYPES.BOSS_KEY) {
      state.bossKeyMask |= reward.value;
    } else if (reward.type === REWARD_TYPES.SIGMA_KEY) {
      for (const key of SIGMA_KEYS) {
        if ((reward.value & key.value) === key.value) state.sigmaKeys.add(key.value);
      }
    }
  }
}

function getMissingProgression(state, options) {
  const missing = [];

  for (const key of SIGMA_KEYS) {
    if (!state.sigmaKeys.has(key.value)) missing.push(key.label);
  }

  if (state.weapons.size === 0) missing.push("Any Boss Weapon");

  if (options.requireFullProgression) {
    for (const armor of ARMOR_PARTS) {
      if ((state.armorMask & armor.value) !== armor.value) missing.push(armor.label);
    }

    if (options.lockBossAccess) {
      for (const key of getBossKeys()) {
        if ((state.bossKeyMask & key.value) !== key.value) missing.push(key.label);
      }
    }
  }

  return missing;
}

function getBlockingRewards(plan, state, collectedLocations, defeatedBosses, options) {
  const candidates = new Map();
  const flexibleTargets = new Set();

  for (const [locationId, rewards] of plan.locationRewards) {
    if (rewards.some((reward) => isMissingProgressionReward(reward, state, options))) {
      flexibleTargets.add(locationId);
    }
  }

  for (const stage of STAGES) {
    for (const location of stage.locations) {
      const locationKey = `${stage.id}:${location.id}`;
      if (collectedLocations.has(locationKey)) continue;
      if (!flexibleTargets.has(location.id)) continue;

      for (const requirement of getLocationRequirements(location, plan)) {
        if (hasRequirement(requirement, state)) continue;
        const reward = requirementToReward(requirement);
        if (reward) candidates.set(rewardKey(reward), reward);
      }
    }

    const bossHasMissingProgression = (plan.bossRewards.get(stage.id) ?? [])
      .some((reward) => isMissingProgressionReward(reward, state, options));
    if (options.randomizeBossWeaknesses && !defeatedBosses.has(stage.id) &&
        (bossHasMissingProgression || options.requireFullProgression) && stage.id !== plan.bossWeaknesses.busterBossId) {
      const weapon = BOSS_WEAPONS.find(w => w.value === plan.bossWeaknesses.mavericks[stage.id]);
      if (!state.weapons.has(weapon.value)) candidates.set(rewardKey(weapon), cloneReward(weapon));
    }
    if (
      options.lockBossAccess &&
      !defeatedBosses.has(stage.id) &&
      bossHasMissingProgression
    ) {
      const key = getBossKeys().find((entry) => entry.value === stage.boss.requiredKeyMask);
      if (key && (state.bossKeyMask & key.value) !== key.value) {
        candidates.set(rewardKey(key), cloneReward(key));
      }
    }
  }

  return [...candidates.values()];
}

function isMissingProgressionReward(reward, state, options) {
  if (reward.type === REWARD_TYPES.SIGMA_KEY) {
    return SIGMA_KEYS.some((key) => key.value === reward.value && !state.sigmaKeys.has(key.value));
  }

  if (reward.type === REWARD_TYPES.ARMOR_PART) {
    return options.requireFullProgression && (state.armorMask & reward.value) !== reward.value;
  }

  if (reward.type === REWARD_TYPES.BOSS_WEAPON) {
    return options.randomizeBossWeaknesses ? !state.weapons.has(reward.value) : state.weapons.size === 0;
  }

  if (reward.type === REWARD_TYPES.BOSS_KEY && options.lockBossAccess) {
    return (state.bossKeyMask & reward.value) !== reward.value;
  }

  return false;
}

function hasRouteProgressionReward(rewards, state, options, plan, collectedLocations) {
  return rewards.some((reward) => isRouteProgressionReward(reward, state, options, plan, collectedLocations));
}

function isRouteProgressionReward(reward, state, options, plan, collectedLocations) {
  if (reward.type === REWARD_TYPES.SIGMA_KEY) {
    return SIGMA_KEYS.some((key) => key.value === reward.value && !state.sigmaKeys.has(key.value));
  }

  if (reward.type === REWARD_TYPES.ARMOR_PART) {
    if ((state.armorMask & reward.value) === reward.value) return false;
    return options.requireFullProgression ||
      unlocksProgressionLocation("armor", reward.value, state, options, plan, collectedLocations);
  }

  if (reward.type === REWARD_TYPES.BOSS_WEAPON) {
    if (state.weapons.has(reward.value)) return false;
    if (options.randomizeBossWeaknesses) return true;
    return state.weapons.size === 0 ||
      unlocksProgressionLocation("weapon", reward.value, state, options, plan, collectedLocations);
  }

  if (reward.type === REWARD_TYPES.BOSS_KEY) {
    return options.lockBossAccess && (state.bossKeyMask & reward.value) !== reward.value;
  }

  return false;
}

function unlocksProgressionLocation(requirementKind, requirementValue, state, options, plan, collectedLocations) {
  for (const stage of STAGES) {
    for (const location of stage.locations) {
      const locationKey = `${stage.id}:${location.id}`;
      if (collectedLocations.has(locationKey)) continue;
      if (!getLocationRequirements(location, plan).some((requirement) =>
        requirement.kind === requirementKind && requirement.value === requirementValue
      )) {
        continue;
      }

      const rewards = plan.locationRewards.get(location.id) ?? [];
      if (rewards.some((reward) => isDirectProgressionReward(reward, state, options))) return true;
    }
  }

  return false;
}

function isDirectProgressionReward(reward, state, options) {
  if (reward.type === REWARD_TYPES.SIGMA_KEY) {
    return SIGMA_KEYS.some((key) => key.value === reward.value && !state.sigmaKeys.has(key.value));
  }

  if (reward.type === REWARD_TYPES.ARMOR_PART) {
    return options.requireFullProgression && (state.armorMask & reward.value) !== reward.value;
  }

  if (reward.type === REWARD_TYPES.BOSS_WEAPON) {
    return options.randomizeBossWeaknesses ? !state.weapons.has(reward.value) : state.weapons.size === 0;
  }

  if (reward.type === REWARD_TYPES.BOSS_KEY) {
    return options.lockBossAccess && (state.bossKeyMask & reward.value) !== reward.value;
  }

  return false;
}

function requirementToReward(requirement) {
  if (requirement.kind === "armor") {
    const match = ARMOR_PARTS.find((item) => item.value === requirement.value);
    return match ? cloneReward(match) : null;
  }

  if (requirement.kind === "weapon") {
    const match = BOSS_WEAPONS.find((item) => item.value === requirement.value);
    return match ? cloneReward(match) : null;
  }

  return null;
}
