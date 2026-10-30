# Mega Man Xtreme Randomizer

**English** | [Español](README.es.md)

A browser-based randomizer for **Mega Man Xtreme on Game Boy Color**. Mix item
locations, boss rewards and weaknesses to create a reproducible progression route.
You supply your own compatible game copy; no ROMs or emulators are included.

## Randomization options

### Randomize items — on by default

Shuffles Heart Tanks, Sub Tanks and Zero Skills among eligible item checks.
Shotokan can also appear as a rare reward. When disabled, these rewards stay at
their original checks. Rewards already included in Starting Gear are replaced
with filler instead of being awarded twice; this also applies to armor checks.

### Randomize armor — on by default

Adds the helmet, Buster upgrade, body armor and boots to the shuffled pool.
When disabled, armor remains at its original capsule checks. If boss rewards
are also randomized, armor can appear as a boss reward and weapons can appear
at eligible armor checks.

### Randomize boss rewards — on by default

Allows the eight boss weapons into the general reward pool. Weapons can appear
outside boss fights, and defeated bosses can award eligible items or armor.
The Items and Armor options determine which location groups join that pool.

When disabled, weapons are **still shuffled among boss rewards**; they do not
automatically return to their original owners. Items and armor are then handled
separately according to their own options.

### Randomize boss weaknesses — off by default

Assigns one weapon weakness to each of the eight Mavericks, using all eight
weapons once across those bosses. Sigma's final head gets an independent
weakness. Some assignments may match vanilla by chance.

Normal and charged weakness damage is selected per boss and seed between
**4 and 7**, inclusive. Charged damage is never lower than normal damage.
Boss HP and Buster damage remain unchanged.

For Chill Penguin, Spark Mandrill, Morph Moth, Magna Centipede and Flame Stag,
the special reaction is assigned independently to one **normal or charged attack
of a different weapon**. Only that selected variant activates it. The reaction
attack deals 1 damage per accepted hit, even if it was previously immune; the
damage weakness still deals 4–7 but no longer activates the special reaction.

Armored Armadillo uses the same weakness before and after losing his armor.
Armor break remains linked to his damage weakness: Armadillo is excluded from
independent reactions to preserve this structural transition. Eagle, Gator and
Sigma keep their generic damage responses. Sigma's earlier forms, body/claws
and vulnerability windows retain their original behavior.

Progression logic requires each assigned weakness, except for one designated
Buster starter selected by seed. That exception does not bypass boss keys.
Sigma's assigned weapon is also required by logic. Independent reaction attacks
are optional tools, not extra progression requirements. Charged reactions need
the Buster upgrade. The spoiler identifies damage weaknesses, their damage,
reaction weapons and charge variants, and the Buster starter.

When disabled, boss weaknesses and damage stay vanilla. Regenerating a supported
ROM that previously used this option restores its original combat tables.

### Lock boss access — off by default

Adds eight boss keys to the progression pool. Each boss requires its matching
key before the fight can be accessed. Keys can appear alongside other rewards,
so finding a key does not necessarily mean defeating its own boss first.

When disabled, all eight boss keys are granted automatically at the start,
including in the None Starting Gear mode. The two Sigma keys remain part of
progression regardless of this option.

### Require full progression — off by default

Requires the solver to reach all **20 item checks and eight boss rewards**, as
well as the final objective. This also checks the necessary armor and boss keys.
Enable it if you want every check to be available in the generated route.

When disabled, the solver accepts a route to the final objective and may leave
some checks or bosses inaccessible. If randomized weaknesses are enabled,
Sigma's assigned weapon is still required.

### Show item text — off by default

Shows an abbreviated reward name below the health bar when an item is collected.
Gameplay continues while the text is visible. This selects the text-enabled
base patch without changing item placements. Starting Gear is granted silently.

### Generate spoiler log — on by default

Downloads a TXT alongside the generated ROM. It lists options, Starting Gear,
rewards and progression spheres, plus randomized weaknesses and their damage
when enabled. Disable it to avoid downloading that information. This checkbox
does not change the randomized result.

## Starting Gear

| Mode | Behavior |
|---|---|
| **None** | No equipment is added. Automatic boss keys still apply when boss locking is off. The solver does not repair this mode by granting extra gear. |
| **Normal** — default | Selects two starting rewards deterministically from the seed. Shotokan can rarely replace one of them. |
| **Generous** | Selects four starting rewards, prioritizing useful early upgrades. Shotokan can rarely replace one. |
| **Custom** | Uses your selected armor parts, weapons and Zero Skills. Extra items are added only if necessary for a completable route. |

Normal and Generous may also receive progression safety items when needed.
Starting items are removed from the reward pool and replaced appropriately.
The spoiler distinguishes selected gear from safety additions.

The ROM's starting table holds **eight entries after compatible groups are
compressed**. All armor parts, all Zero Skills and all boss keys can each use
one grouped entry; weapons use separate entries. Eight weapons fit when boss
locking is enabled, but need a ninth entry for automatic keys when it is off.
Selecting all weapons, armor and skills exceeds the limit and is rejected.

## Palettes and previews

- **X and weapon tabs:** edit X's palette and each of the eight weapon palettes
  independently. Normal and armored previews use the selected palette.
- **Presets and manual values:** choose a preset for the current tab or edit
  its eight hexadecimal bytes, representing four colors.
- **Random — all palettes:** generates all nine palettes with controlled
  contrast and related colors. Results are hidden in the preview as a surprise.
- **Chaos — all palettes:** generates all nine with a wider, less restricted
  color range, also hidden in the preview.
- **Save / Load palettes:** exports or imports the complete set of nine
  palettes as a TXT. These controls change colors, not progression.

## Seeds, downloads and in-game controls

Share the full **MXT2 seed code**, not just its friendly name. It restores the
options, Starting Gear and palettes needed to reproduce the result. Applying an
existing seed replaces the current settings with its saved configuration.

**Generate and download** creates the configured ROM. **Download BPS** saves a
patch for that result; it must be applied to the exact file selected as input.
If your input was already randomized, the downloaded BPS requires that input,
not a clean ROM. Required base patches are applied automatically by the app.

In game, **Select** opens pause, **Start** shows boss/Sigma keys, and **B**
returns to the weapon menu. Subtanks are hidden only while viewing the keys.

The optional **BizHawk tracker** is available from the download button. Extract
the archive and follow [the tracker instructions](bizhawk/README.md). BizHawk
itself is not included. The interface language button switches English/Spanish.

## Credits and license

Project code is distributed under [MIT](LICENSE). Thanks to ElwinBran for the
Hard/Xtreme-from-start hack, and ElwinBran and Thirteen 1355 for weapon-refill work:

- [Enable Hard and Xtreme Mode from Start](https://www.romhacking.net/hacks/5020/)
- [Weapons Refill Upon Death](https://www.romhacking.net/hacks/4827/)

Mega Man Xtreme and related trademarks, characters and graphics belong to Capcom.
The code license does not grant ownership of game assets. Users must provide
their own legally obtained game copy. This repository contains no ROMs or saves.

## Running the generator

### Locally

From the project folder, start a static HTTP server:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`, load your compatible ROM, choose the options and
generate the result. No Node dependencies or compilation are required. Avoid
opening `index.html` directly with `file://`, which can block patch loading.

### GitHub Pages

Upload the project folder's **contents**, preserving `js`, `css`, `patches` and
`bizhawk`. In repository settings, configure Pages to serve the chosen branch's
root folder. Keep `.nojekyll`, both root BPS files and the compiled patch assets.
Extract the distribution ZIP before uploading its files manually to GitHub.
