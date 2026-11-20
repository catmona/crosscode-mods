// Smooth Stick Aim: makes analog sticks keep the direction you push.
//
// Stock CrossCode checks each stick axis on its own (|x| or |y| over ~0.25): a square dead
// zone, so a diagonal push needs much more travel to start aiming than a straight one. It also
// drags the crosshair toward you while a released stick springs back to centre. Many sticks
// reach about 1.3 on the diagonals, so diagonal aim reaches further.
//
// This mod, for each stick on each pad:
// - applies a round dead zone and rescales the rest to start at 0 (each axis stays within 1,
//   as in the base game, so menus and walking read diagonals as before);
// - decides "stick pushed" from that length, with hysteresis;
// - holds the crosshair still while the right stick snaps back to centre after a release.
// Settings (Options > Gamepad):
// - Far Crosshair (on by default): the crosshair sits at full distance in the pushed direction
//   however far the stick is pushed. Throws only use its direction; the game also uses its
//   distance to look ahead with the camera, so with this on the camera always looks ahead
//   while aiming. Off = stock: light push, crosshair close and camera still.
// - Stick Dead Zone: size of the round dead zone (8% by default).
// - Aim Speed (75% by default; 100% = stock): how fast the crosshair swings to the stick's
//   direction. Faster cuts the lag behind the stick but shows the stick's bursty updates as jumpy
//   motion (many sticks send readings in bursts); it doesn't add throw spread.
// - Fine Aim (50% by default): while the right stick turns slowly (under 40 deg/s), the aim
//   turns only part as far (50% = half), so small adjustments take bigger thumb movements.
//   Faster turns are 1:1 and pull the aim back onto the stick (fully above 160 deg/s); the aim
//   never strays more than 15 deg from the stick, and every new push starts on the stick.
ig.module('mod.smooth-stick-aim')
	.requires(
		'impact.feature.gamepad.gamepad',
		'game.feature.player.entities.crosshair',
		'game.feature.model.options-model'
	)
	.defines(function () {
		var DOWN_ON = 0.2; // shaped length that counts as pushed
		var DOWN_OFF = 0.1; // ...and stops counting once below this
		var RELEASE_DROP = 0.2; // a fall this big in one frame is the stick springing back
		var RELEASE_MAX = 0.1; // seconds; a real release reaches centre well within this
		var FINE_SLOW = (40 * Math.PI) / 180; // rad/s: turns slower than this get the full Fine Aim
		var FINE_FAST = (160 * Math.PI) / 180; // rad/s: turns faster than this are 1:1 and realign
		var FINE_MAX_OFF = (15 * Math.PI) / 180; // the aim never strays further from the stick
		var FINE_SPEED_SMOOTH = 0.05; // seconds; smooths the turn speed so one jumpy frame can't decide

		var OPT_FAR = 'smooth-stick-aim-far-crosshair';
		var OPT_DEAD_ZONE = 'smooth-stick-aim-dead-zone';
		var OPT_AIM_SPEED = 'smooth-stick-aim-aim-speed';
		var OPT_FINE = 'smooth-stick-aim-fine-aim';
		var DEFAULTS = {};
		DEFAULTS[OPT_FAR] = true;
		DEFAULTS[OPT_DEAD_ZONE] = 0.08;
		DEFAULTS[OPT_AIM_SPEED] = 0.75;
		DEFAULTS[OPT_FINE] = 0.5;

		var cat = sc.OPTION_CATEGORY.GAMEPAD;
		sc.OPTIONS_DEFINITION[OPT_FAR] = {
			type: 'CHECKBOX',
			init: DEFAULTS[OPT_FAR],
			cat: cat,
			hasDivider: true,
			header: 'smooth-stick-aim'
		};
		sc.OPTIONS_DEFINITION[OPT_DEAD_ZONE] = {
			type: 'OBJECT_SLIDER',
			data: { D0: 0, D2: 0.02, D4: 0.04, D6: 0.06, D8: 0.08, D10: 0.1, D12: 0.12, D15: 0.15, D20: 0.2 },
			init: DEFAULTS[OPT_DEAD_ZONE],
			cat: cat,
			fill: true,
			showPercentage: true
		};
		sc.OPTIONS_DEFINITION[OPT_AIM_SPEED] = {
			type: 'OBJECT_SLIDER',
			data: { S50: 0.5, S75: 0.75, S100: 1, S125: 1.25, S150: 1.5, S200: 2, S300: 3 },
			init: DEFAULTS[OPT_AIM_SPEED],
			cat: cat,
			fill: true,
			showPercentage: true
		};

		sc.OPTIONS_DEFINITION[OPT_FINE] = {
			type: 'OBJECT_SLIDER',
			data: { F0: 0, F25: 0.25, F40: 0.4, F50: 0.5, F60: 0.6, F75: 0.75 },
			init: DEFAULTS[OPT_FINE],
			cat: cat,
			fill: true,
			showPercentage: true
		};

		// A setting's value, or its default before the options model exists or if the value is
		// not one the slider offers (so the slider never shows a broken position).
		function setting(key) {
			var v = sc.options && sc.options.get ? sc.options.get(key) : undefined;
			var def = sc.OPTIONS_DEFINITION[key];
			if (def.type === 'CHECKBOX') return typeof v === 'boolean' ? v : DEFAULTS[key];
			for (var k in def.data) if (def.data[k] === v) return v;
			return DEFAULTS[key];
		}

		var AXES = [
			[ig.AXES.LEFT_STICK_X, ig.AXES.LEFT_STICK_Y],
			[ig.AXES.RIGHT_STICK_X, ig.AXES.RIGHT_STICK_Y]
		];
		var STICK_OF = {};
		STICK_OF[ig.AXES.LEFT_STICK_X] = STICK_OF[ig.AXES.LEFT_STICK_Y] = 0;
		STICK_OF[ig.AXES.RIGHT_STICK_X] = STICK_OF[ig.AXES.RIGHT_STICK_Y] = 1;

		function num(v) {
			return typeof v === 'number' && isFinite(v) ? v : 0;
		}

		function clamp1(v) {
			return v > 1 ? 1 : v < -1 ? -1 : v;
		}

		// Raw stick (x, y) -> shaped [x, y] in the same direction, each axis within -1..1. The
		// length isn't capped at 1: menus check each axis against 0.8, and a capped full diagonal
		// (0.71, 0.71) would miss both. Only placing the crosshair caps the length.
		function shape(x, y, deadZone) {
			var r = Math.sqrt(x * x + y * y);
			if (!(r > deadZone)) return [0, 0]; // also catches NaN and r = 0
			var len = (r - deadZone) / (1 - deadZone);
			return [clamp1((x / r) * len), clamp1((y / r) * len)];
		}

		function newStick() {
			return { down: false, len: 0, releasing: false, releaseTime: 0, releaseMin: 0, aimSet: false, aim: 0, aimIn: 0, aimSpeed: 0 };
		}

		function wrap(a) {
			while (a > Math.PI) a -= 2 * Math.PI;
			while (a < -Math.PI) a += 2 * Math.PI;
			return a;
		}

		// Fine Aim: st.aim is the aim angle, which trails the stick's angle on slow turns.
		function updateAim(st, x, y, dt, fine) {
			if (!st.down || !(x || y)) {
				st.aimSet = false;
				return;
			}
			var a = Math.atan2(y, x);
			if (!st.aimSet || !(fine > 0) || !(dt > 0)) {
				st.aimSet = true;
				st.aim = st.aimIn = a;
				st.aimSpeed = 0;
				return;
			}
			var d = wrap(a - st.aimIn);
			st.aimIn = a;
			st.aimSpeed += (Math.abs(d) / dt - st.aimSpeed) * Math.min(1, dt / FINE_SPEED_SMOOTH);
			var t = Math.max(0, Math.min(1, (st.aimSpeed - FINE_SLOW) / (FINE_FAST - FINE_SLOW)));
			var off = wrap(st.aim + (1 - fine * (1 - t)) * d - a) * Math.pow(1 - t, dt * 60);
			st.aim = a + Math.max(-FINE_MAX_OFF, Math.min(FINE_MAX_OFF, off));
		}

		function updatePad(pad, dt, deadZone, fine) {
			if (!pad.smoothStickAim) pad.smoothStickAim = [newStick(), newStick()];
			var raw = pad.smoothStickAimRaw || [];
			for (var i = 0; i < 2; i++) {
				var st = pad.smoothStickAim[i];
				var x = num(raw[AXES[i][0]]),
					y = num(raw[AXES[i][1]]);
				var out = shape(x, y, deadZone);
				pad.axesStates[AXES[i][0]] = out[0];
				pad.axesStates[AXES[i][1]] = out[1];
				// Capped, so turning from a diagonal (about 1.3) to a straight push (1) isn't a drop
				// that looks like a release.
				var len = Math.min(1, Math.sqrt(out[0] * out[0] + out[1] * out[1]));

				st.down = st.down ? len > DOWN_OFF : len > DOWN_ON;
				if (!st.down) st.releasing = false;
				else if (st.len - len >= RELEASE_DROP) {
					if (!st.releasing) st.releaseTime = 0;
					st.releasing = true;
					st.releaseMin = len;
				} else if (st.releasing) {
					st.releaseTime += dt;
					st.releaseMin = Math.min(st.releaseMin, len);
					if (len > st.releaseMin + 0.1 || st.releaseTime > RELEASE_MAX) st.releasing = false;
				}
				st.len = len;
				// The raw direction: the same as the shaped one before an axis is clamped to 1.
				if (i === 1) updateAim(st, x, y, dt, fine);
			}
		}

		function aimOf(manager) {
			for (var p = manager.activeGamepads.length; p--; ) {
				var s = manager.activeGamepads[p].smoothStickAim;
				if (s && s[1].down && s[1].aimSet) return s[1].aim;
			}
			return null;
		}

		function anyStick(manager, i, field) {
			for (var p = manager.activeGamepads.length; p--; ) {
				var s = manager.activeGamepads[p].smoothStickAim;
				if (s && s[i][field]) return true;
			}
			return false;
		}

		ig.Gamepad.inject({
			updateAxes: function (a, b) {
				(this.smoothStickAimRaw || (this.smoothStickAimRaw = []))[a] = b;
				this.parent(a, b);
			}
		});

		ig.GamepadManager.inject({
			onPreUpdate: function () {
				var result = this.parent();
				var dt = (ig.system && ig.system.actualTick) || 0;
				var deadZone = setting(OPT_DEAD_ZONE),
					fine = setting(OPT_FINE);
				for (var key in this.gamepads) updatePad(this.gamepads[key], dt, deadZone, fine);
				return result;
			},
			isLeftStickDown: function () {
				return anyStick(this, 0, 'down');
			},
			isRightStickDown: function () {
				return anyStick(this, 1, 'down');
			},
			// Shaped sticks already have their dead zone; don't cut each axis a second time.
			getAxesValue: function (a, useDeadzone) {
				var stick = STICK_OF[a];
				if (stick === undefined) return this.parent(a, useDeadzone);
				var v = this.parent(a, false);
				if (stick !== 1 || !this.smoothStickAimPlacing) return v;
				// Right stick while the crosshair is placed: the Fine Aim angle, at full length
				// with Far Crosshair on.
				var isX = a === ig.AXES.RIGHT_STICK_X;
				var other = this.parent(isX ? ig.AXES.RIGHT_STICK_Y : ig.AXES.RIGHT_STICK_X, false);
				var len = Math.sqrt(v * v + other * other);
				if (!(len > 0)) return 0;
				var out = this.smoothStickAimFar ? 1 : Math.min(1, len);
				var aim = aimOf(this);
				if (aim === null) return (v / len) * out;
				return (isX ? Math.cos(aim) : Math.sin(aim)) * out;
			},
			smoothStickAimReleasing: function () {
				return anyStick(this, 1, 'releasing');
			}
		});

		sc.PlayerCrossHairController.inject({
			updatePos: function (crosshair) {
				var pads = ig.gamepad;
				if (!this.gamepadMode || !pads || !pads.smoothStickAimReleasing) return this.parent(crosshair);
				if (pads.smoothStickAimReleasing()) return;
				var pos = crosshair.coll.pos,
					oldX = pos.x,
					oldY = pos.y;
				pads.smoothStickAimPlacing = true;
				pads.smoothStickAimFar = setting(OPT_FAR);
				var result;
				try {
					result = this.parent(crosshair);
				} finally {
					pads.smoothStickAimPlacing = false;
				}
				// The game moves the crosshair a fraction k = actualTick * 18 of the way to the
				// stick's target each frame; scale that step so the fraction becomes k * speed.
				var speed = setting(OPT_AIM_SPEED);
				var k = ((ig.system && ig.system.actualTick) || 0) * 18;
				if (speed !== 1 && k > 0) {
					var ratio = Math.min(1, k * speed) / Math.min(1, k);
					pos.x = oldX + (pos.x - oldX) * ratio;
					pos.y = oldY + (pos.y - oldY) * ratio;
				}
				return result;
			}
		});

		window.smoothStickAim = { shape: shape, setting: setting, updateAim: updateAim, newStick: newStick };
	});
