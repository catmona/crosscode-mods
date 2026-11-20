# CrossCode Mods

Small quality-of-life mods for [CrossCode](https://store.steampowered.com/app/368340/CrossCode/), made for [CCLoader](https://github.com/CCDirectLink/CCLoader).

| Mod | What it does | Download |
|---|---|---|
| [**Smooth Stick Aim**](#smooth-stick-aim) | Analog aiming that goes exactly where you push, with a round dead zone, even reach in every direction and no crosshair drag when you let go. | [1.3.4](https://github.com/catmona/crosscode-mods/releases/tag/smooth-stick-aim-v1.3.4) |
| [**Switch Button Icons**](#switch-button-icons) | Nintendo Switch button prompts, picked in the game's own options. | [1.1.0](https://github.com/catmona/crosscode-mods/releases/tag/switch-button-icons-v1.1.0) |

## Install

1. Install [CCLoader](https://github.com/CCDirectLink/CCLoader) if you don't have it.
2. Download the mod's `.ccmod` file from its release (links above, or [all releases](https://github.com/catmona/crosscode-mods/releases)).
3. Put the file in `CrossCode/assets/mods/` and start the game.

To uninstall, delete the `.ccmod` file. Settings the mod saved are ignored once it's gone.

---

## Smooth Stick Aim

The base game reads each stick axis on its own. That gives a square dead zone, so a diagonal push needs more travel to start aiming than a straight one. It also gives uneven reach, since most sticks go further on the diagonals. And when you let go of the right stick, the crosshair is dragged back toward you while the stick springs to centre.

This mod fixes all three:

- **Round dead zone.** A stick counts as pushed by how far it moves in any direction, so diagonals respond as easily as straight pushes.
- **Same reach everywhere.** The crosshair goes the same distance in every direction.
- **No release drag.** Letting go leaves the crosshair where you aimed.

Menus and walking read the sticks as before, apart from the round dead zone.

### Settings

Options > Gamepad, under **Smooth Stick Aim**:

| Setting | Default | What it does |
|---|---|---|
| **Far Crosshair** | On | Keeps the crosshair at full distance in the direction you push, however lightly you push. Throws only use the crosshair's direction, so they land the same either way. The camera also looks ahead toward the crosshair (about 72 px) while you aim. Turn it off for the base game's behaviour: a light push keeps the crosshair close and the camera still. |
| **Stick Dead Zone** | 8% | How far a stick has to move before it counts, the same in every direction (0-20%). Raise it if a worn stick drifts. |
| **Fine Aim** | 50% | Precision for small corrections. While the right stick turns slowly (under 40°/s), the aim turns only part as far: at 50%, half. Faster turns are 1:1 and pull the aim back onto the stick (fully above 160°/s). The aim never strays more than 15° from the stick, and every new push starts exactly on it. 0% turns it off. |
| **Aim Speed** | 75% | How fast the crosshair swings to where the stick points (50-300%; 100% is the base game). Higher settings trail the stick less but look jumpier. |

None of the settings change throw spread.

<details>
<summary><b>How the defaults were chosen</b></summary>

A 20-second recording of real stick input was replayed through the mod using the game's own crosshair and spread rules (spread up to 90°, shrinking by 180° per second, growing when the crosshair turns more than 2.8° in a frame):

| Aim Speed | Crosshair lag behind the stick | Unevenness while turning | Average throw spread |
|---|---|---|---|
| **75%** | 5.0° | 0.14 | 4.9° |
| 100% (base game) | 3.3° | 0.18 | 4.9° |
| 150% | 1.9° | 0.25 | 4.9° |
| 200% | 0.9° | 0.31 | 3.8° |
| 300% | 0.2° | 0.41 | 3.7° |

*Unevenness* is how much the crosshair's frame-to-frame steps vary during a steady turn, relative to their size. Many controllers send stick readings in bursts, so some frames get no new reading and the next gets two. Smoothing hides that, and faster settings smooth less.

- **Aim Speed 75%.** Lag and smoothness trade off directly, so this one comes down to feel. 75% felt best in play (100% close behind, 300% too jumpy). Averaging over several frames instead did no better.
- **Fine Aim 50%.** Doubles the precision of slow adjustments and still leaves a 30° range of fine control before the 15° limit takes over (75% would leave only 20°).
- **Stick Dead Zone 8%.** Enough to stop a stick that rests a little off centre from holding the crosshair up after you let go.
- **Far Crosshair on.** A camera preference: on looks ahead while you aim, off keeps the base game's camera.

</details>

### Compatibility

Smooth Stick Aim replaces the game's stick checks (`isLeftStickDown`, `isRightStickDown`) and its per-axis stick dead zone. Mods that only read stick values work with it. Mods that replace the same checks may conflict.

---

## Switch Button Icons

Adds a **Switch** choice to Options > Gamepad > Gamepad Icons, drawn from the Nintendo button art already in the game. The letters match the button positions of an Xbox-style layout:

| Position | Button shown |
|---|---|
| Bottom | A |
| Right | B |
| Left | X |
| Top | Y |
| Select / Start | − / + |

The mod ships an edited copy of the game's gamepad icon sheet with the Switch glyphs rearranged.

---

Unofficial; not affiliated with Radical Fish Games. Mostly written with AI assistance (Anthropic's Claude), reviewed and tested by the maintainer. Use at your own risk.
