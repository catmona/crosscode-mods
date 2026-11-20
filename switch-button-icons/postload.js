// Postload runs before the game's modules are defined, so hook in as a module
// that waits for the font system and the options model.
ig.module('mod.switch-button-icons')
	.requires('game.feature.font.font-system', 'game.feature.model.options-model')
	.defines(function () {
		var SWITCH = 2;
		sc.GAMEPAD_ICON_OPTION.SWITCH = SWITCH; // the option menu builds one button per key here
		var fs = sc.fontsystem;
		// Same slot layout as the Xbox rows of icons-gamepad.png, drawn with Nintendo glyphs.
		var switchSheet = new ig.Font('media/font/icons-gamepad-switch.png', 16, ig.MultiFont.ICON_START);
		var GAMEPAD_SET = fs.font.iconSets.indexOf(fs.icons.gamepad); // 2 in 1.4.2
		var orig = fs.setGamepadIconStyle;
		fs.setGamepadIconStyle = function (style) {
			var isSwitch = style === SWITCH;
			this.font.setIconSet(isSwitch ? switchSheet : this.icons.gamepad, GAMEPAD_SET);
			return orig.call(this, isSwitch ? sc.GAMEPAD_ICON_STYLE.XBOX : style);
		};
	});
