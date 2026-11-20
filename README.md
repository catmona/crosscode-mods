# CrossCode mods

Small CrossCode mods for CCLoader. Each folder is one mod; each mod has its own release with a `.ccmod` file.

| Mod | What it does |
|---|---|
| [Smooth Stick Aim](smooth-stick-aim) | Analog stick aiming that keeps the direction you push. A round dead zone replaces the game's square one, every direction has the same reach, and the crosshair no longer drags toward you when you let go of the stick. Adjustable in Options > Gamepad (see below). Made for handhelds like the AYN Thor; works with any controller. |
| [Switch Button Icons](switch-button-icons) | Adds a Switch choice to Options > Gamepad > Gamepad Icons, using the Nintendo button art from the game, with letters matching Xbox-labeled buttons. |

## Install

Download the mod's `.ccmod` file from [Releases](https://github.com/catmona/crosscode-mods/releases) and put it in `CrossCode/assets/mods/`. You need [CCLoader](https://github.com/CCDirectLink/CCLoader).

## Smooth Stick Aim settings

In Options > Gamepad, under Smooth Stick Aim:

| Setting | Default | What it does |
|---|---|---|
| Far Crosshair | On | The crosshair stays at full distance in the direction you push, however lightly you push. Throws only use the crosshair's direction, so where they go doesn't change. The game also uses the crosshair's distance to move the camera ahead of you, so with this on the camera always looks ahead (about 72 px) while you aim. Turn it off for the base game's behaviour: a light push keeps the crosshair close and the camera still, a full push looks ahead. |
| Stick Dead Zone | 8% | How far a stick moves before it counts, the same in every direction (0-20%). Raise it if a worn stick drifts. |
| Fine Aim | 50% | While the right stick turns slowly (under 40°/s), the aim turns only part as far: at 50%, half. Small adjustments then take twice the thumb movement. Faster turns are 1:1 and pull the aim back onto the stick (fully above 160°/s); the aim never strays more than 15° from the stick, and every new push starts exactly on it. 0% is off. It doesn't change throw spread. |
| Aim Speed | 100% | How fast the crosshair swings to where the stick points (50-300%; 100% is the base game, which closes about 30% of the remaining turn each frame). Faster settings trail the stick less but look jumpier, because they stop smoothing out the stick's uneven updates. Throw spread doesn't change. |

### How the defaults were chosen

From a 20-second recording of real aiming on an AYN Thor, replayed through the mod with the game's own crosshair and spread rules (spread up to 90°, shrinking by 180° per second, growing when the crosshair turns more than 2.8° in a frame):

| Aim Speed | Crosshair lag behind the stick (average) | Unevenness of motion while turning | Average throw spread |
|---|---|---|---|
| 100% (base game) | 3.3° | 0.18 | 4.9° |
| 150% | 1.9° | 0.25 | 4.9° |
| 200% | 0.9° | 0.31 | 3.8° |
| 300% | 0.2° | 0.41 | 3.7° |

(Unevenness: how much the crosshair's frame-to-frame steps vary during a steady turn, relative to their size. The Thor's stick sends readings in bursts, so some frames get none and the next gets two; the base game's smoothing hides that.)

- **Aim Speed 100%.** Lag and jumpiness trade off directly, and averaging a few frames instead did no better. On the Thor, 75-100% felt best and 300% too jumpy, so the default stays the base game. Faster settings never add throw spread.
- **Fine Aim 50%.** A replay can't score this one, because how you correct depends on what you see. 50% doubles the precision of slow adjustments and still leaves a 30° range of fine control before the 15° limit takes over (75% would leave 20°).
- **Stick Dead Zone 8%.** The Thor's stick returns to exactly 0, so any value works on it. 8% is for other controllers: a worn stick that rests a little off centre could otherwise keep the crosshair up after you let go.
- **Far Crosshair on.** A camera preference: on looks ahead while aiming, off keeps the base game's camera.

## Notes

- **Smooth Stick Aim** replaces the game's stick checks (`isLeftStickDown`, `isRightStickDown`) and turns off the game's per-axis dead zone for stick values. Other mods that only read stick values work with it.
- **Switch Button Icons** ships an edited copy of the game's gamepad icon sheet with the Switch glyphs rearranged.

Unofficial; not affiliated with Radical Fish Games. Mostly written with AI assistance (Anthropic's Claude), reviewed and tested by the maintainer. Use at your own risk.
