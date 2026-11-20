// Smooth Stick Aim: makes analog sticks keep the direction you push.
//
// Stock CrossCode checks each stick axis on its own (|x| or |y| over ~0.25): a square dead
// zone, so a diagonal push needs much more travel to start aiming than a straight one. It also
// drags the crosshair toward you while a released stick springs back to centre. Many sticks
// (e.g. the AYN Thor's) reach about 1.3 on the diagonals, so diagonal aim reaches further.
// And the crosshair sits as far out as the stick is pushed, so a light push puts it right next
// to you, where it is hard to see which way it points (throws only use its direction).
//
// This mod, for each stick on each pad:
// - applies a round dead zone, rescales the rest to start at 0 and caps the length at 1;
// - decides "stick pushed" from that length, with hysteresis;
// - holds the crosshair still while the right stick snaps back to centre after a release;
// - keeps the crosshair at full distance in the pushed direction, however far the stick is
//   pushed (the game also uses that distance to look ahead with the camera, as on a full push).
ig.module('mod.smooth-stick-aim')
	.requires('impact.feature.gamepad.gamepad', 'game.feature.player.entities.crosshair')
	.defines(function () {
		var DEAD_ZONE = 0.08; // of the stick's travel
		var DOWN_ON = 0.2; // shaped length that counts as pushed
		var DOWN_OFF = 0.1; // ...and stops counting once below this
		var RELEASE_DROP = 0.2; // a fall this big in one frame is the stick springing back
		var RELEASE_MAX = 0.1; // seconds; a real release reaches centre well within this

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

		// Raw stick (x, y) -> shaped [x, y] in the same direction, length 0..1.
		function shape(x, y) {
			var r = Math.sqrt(x * x + y * y);
			if (!(r >= DEAD_ZONE)) return [0, 0]; // also catches NaN
			var len = Math.min(1, (r - DEAD_ZONE) / (1 - DEAD_ZONE));
			return [(x / r) * len, (y / r) * len];
		}

		function newStick() {
			return { down: false, len: 0, releasing: false, releaseTime: 0, releaseMin: 0 };
		}

		function updatePad(pad, dt) {
			if (!pad.smoothStickAim) pad.smoothStickAim = [newStick(), newStick()];
			var raw = pad.smoothStickAimRaw || [];
			for (var i = 0; i < 2; i++) {
				var st = pad.smoothStickAim[i];
				var x = num(raw[AXES[i][0]]),
					y = num(raw[AXES[i][1]]);
				var out = shape(x, y);
				pad.axesStates[AXES[i][0]] = out[0];
				pad.axesStates[AXES[i][1]] = out[1];
				var len = Math.sqrt(out[0] * out[0] + out[1] * out[1]);

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
			}
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
				for (var key in this.gamepads) updatePad(this.gamepads[key], dt);
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
				if (stick !== 1 || !this.smoothStickAimDirOnly) return v;
				// Right stick while the crosshair is placed: the pushed direction at full length.
				var other = this.parent(a === ig.AXES.RIGHT_STICK_X ? ig.AXES.RIGHT_STICK_Y : ig.AXES.RIGHT_STICK_X, false);
				var len = Math.sqrt(v * v + other * other);
				return len > 0 ? v / len : 0;
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
				pads.smoothStickAimDirOnly = true;
				try {
					return this.parent(crosshair);
				} finally {
					pads.smoothStickAimDirOnly = false;
				}
			}
		});

		window.smoothStickAim = { shape: shape };
	});
