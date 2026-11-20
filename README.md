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
| Fine Aim | 50% | While the right stick turns slowly (under 40°/s), the aim turns only part as far: at 50%, half. Small adjustments then take twice the thumb movement. Faster turns are 1:1 and pull the aim back onto the stick (fully above 160°/s); the aim never strays more than 15° from the stick, and every new push starts exactly on it. 0% is off. The realign on fast turns adds a little throw spread (replay: average 6.1° off, 6.4° at 50%). |
| Aim Speed | 100% | How fast the crosshair swings to where the stick points (50-300%; 100% is the base game, which closes about 30% of the remaining turn each frame at 60 fps). The game widens throw spread when the crosshair turns quickly, so faster settings snap quicker with slightly wider spread right after a flick (in a replay of real stick input, average spread went from 6.1° at 100% to 6.5° at 300%). |

## Notes

- **Smooth Stick Aim** replaces the game's stick checks (`isLeftStickDown`, `isRightStickDown`) and turns off the game's per-axis dead zone for stick values. Other mods that only read stick values work with it.
- **Switch Button Icons** ships an edited copy of the game's gamepad icon sheet with the Switch glyphs rearranged.

Unofficial; not affiliated with Radical Fish Games. Mostly written with AI assistance (Anthropic's Claude), reviewed and tested by the maintainer. Use at your own risk.
