// Language files are loaded by now: label the settings (English in every language).
(function () {
	var gui = ig.lang.labels && ig.lang.labels.sc && ig.lang.labels.sc.gui;
	var opts = gui && gui.options;
	if (!opts) return;
	if (opts.headers) opts.headers['smooth-stick-aim'] = 'Smooth Stick Aim';
	opts['smooth-stick-aim-far-crosshair'] = {
		name: 'Far Crosshair',
		description:
			'Keep the crosshair at full distance however far you push the stick. Throws go the same way; the camera looks ahead whenever you aim. Off: like the base game.'
	};
	opts['smooth-stick-aim-dead-zone'] = {
		name: 'Stick Dead Zone',
		description: 'How far a stick moves before it counts, in every direction. Raise it if a worn stick drifts.'
	};
	opts['smooth-stick-aim-aim-speed'] = {
		name: 'Aim Speed',
		description:
			'How fast the crosshair swings to where the stick points. 100% is the base game. Faster adds a little throw spread after quick turns.'
	};
})();
