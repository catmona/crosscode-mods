# CrossCode mods

Small CrossCode mods for CCLoader. Each folder is one mod; each mod has its own release with a `.ccmod` file.

| Mod | What it does |
|---|---|
| [Smooth Stick Aim](smooth-stick-aim) | Analog stick aiming that keeps the direction you push. A round dead zone replaces the game's square one, every direction has the same reach, and the crosshair no longer drags toward you when you let go of the stick. Made for handhelds like the AYN Thor; works with any controller. |
| [Switch Button Icons](switch-button-icons) | Adds a Switch choice to Options > Gamepad > Gamepad Icons, using the Nintendo button art from the game, with letters matching Xbox-labeled buttons. |
| [Image Predecode](image-predecode) | Decodes images while an area loads instead of on first draw, so entering a new area doesn't stutter on slow (emulated) setups. |

## Install

Download the mod's `.ccmod` file from [Releases](https://github.com/catmona/crosscode-mods/releases) and put it in `CrossCode/assets/mods/`. You need [CCLoader](https://github.com/CCDirectLink/CCLoader).

## Notes

- **Smooth Stick Aim** replaces the game's stick checks (`isLeftStickDown`, `isRightStickDown`) and turns off the game's per-axis dead zone for stick values. Other mods that only read stick values work with it.
- **Switch Button Icons** ships an edited copy of the game's gamepad icon sheet with the Switch glyphs rearranged.

Unofficial; not affiliated with Radical Fish Games. Mostly written with AI assistance (Anthropic's Claude), reviewed and tested by the maintainer. Use at your own risk.
