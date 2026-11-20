// Chromium decodes an <img> lazily, on its first drawImage. CrossCode marks an
// image loaded as soon as the file arrives, so the decode lands in the first
// frames after an area fades in. Here the game's onload waits for img.decode(),
// which decodes on worker threads, so the loader holds the fade until it's done.
ig.module('mod.image-predecode')
	.requires('impact.base.image')
	.defines(function () {
		if (typeof Image === 'undefined' || !Image.prototype.decode) return; // older Chromium: no-op
		ig.Image.inject({
			onload: function () {
				var self = this, img = this.data, args = arguments;
				var original = this.parent; // the stock onload; it doesn't use this.parent itself
				if (!img || !img.decode) return original.apply(this, args);
				var done = false;
				var finish = function () {
					if (done) return;
					done = true;
					if (self.data !== img) return; // reloaded or cache cleared meanwhile
					original.apply(self, args);
				};
				img.decode().then(finish, finish); // a failed decode still finishes loading
			}
		});
	});
