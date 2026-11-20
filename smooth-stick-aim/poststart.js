// Language files are loaded by now: label the settings (English in every language).
// The help bar is one line: the game's own hints stay under about 90 characters.
(function () {
	var gui = ig.lang.labels && ig.lang.labels.sc && ig.lang.labels.sc.gui;
	var opts = gui && gui.options;
	if (!opts) return;
	if (opts.headers) opts.headers['smooth-stick-aim'] = 'Smooth Stick Aim';
	opts['smooth-stick-aim-far-crosshair'] = {
		name: 'Far Crosshair',
		description: 'Tick to keep the crosshair at full distance. The camera then looks ahead.'
	};
	opts['smooth-stick-aim-dead-zone'] = {
		name: 'Stick Dead Zone',
		description: 'How far a stick moves before it counts. Raise it if a stick drifts.'
	};
	opts['smooth-stick-aim-fine-aim'] = {
		name: 'Fine Aim',
		description: 'Slow stick turns move the aim less, for small adjustments. \\c[3]0%\\c[0] is off.'
	};
	opts['smooth-stick-aim-aim-speed'] = {
		name: 'Aim Speed',
		description: 'How fast the crosshair turns to the stick. \\c[3]100%\\c[0] is the base game.'
	};
})();
