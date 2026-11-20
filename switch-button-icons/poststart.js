// Language files are loaded by now: give the new button its label.
(function () {
	var opts = ig.lang.labels && ig.lang.labels.sc && ig.lang.labels.sc.gui && ig.lang.labels.sc.gui.options;
	var entry = opts && opts['gamepad-icons'];
	if (entry && entry.group && entry.group.length < 3) entry.group.push('Switch');
	if (sc.options && sc.options.get('gamepad-icons') === 2) sc.fontsystem.setGamepadIconStyle(2);
})();
