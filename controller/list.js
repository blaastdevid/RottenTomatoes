var Single = require('../lib/single').Single,
	_ = require('common/util');

var app = this;

_.extend(exports, {
	initialize: function(type) {
		/* XXX workaround runtime bug */
		this.type  = type[0];
		console.log('hereeeeeee ' + this.type);
	},

	':attached': function(param) {
		var self = this;
		
		this.parseMovies = function(action, args) {
			console.log(action);
			console.log(self.type);
			if (action === self.type) {
				if (args.error) {
					console.log(self.type, 'failed:', args.error);
					return;
				}
				
				self.clear();
				args.movies.forEach(function(movie) {

					if (!self.get(movie.id)) {
						self.add(movie.id, new Single(movie));
					}
				});
			}
		};

		app.on('message', this.parseMovies);
	},

	clearUpdate: function() {
		//if (this.updateTweets) {
		//	app.removeListener('connected', this.updateTweets);
		//	delete this.updateTweets;
		//}
	},

	':focus': function() {
		var self = this;

		this.updateMovies = function() {
			app.msg(self.type);
			//self.clearUpdate();
		};

		app.on('connected', this.updateMovies);
	},

	':blur': function() {
		this.clearUpdate();
	},

	':keypress': function(key) {
		if (this.index === undefined) {
			if (this.size() > 0) {
				this.focusItem(0);
			}
		} else if (key === 'up' || key === 'down') {
			var next = this.index + (key === 'up' ? -1 : 1);

			if (next < 0) {
				next = 0;
			} else if (next > (this.size()-1)) {
				next = this.size()-1;
			}

			if (this.index === next) {
				return;
			}

			this.focusItem(next);
		} else if (key === 'fire') {
			this.get(this.index).emit('activate');
		}
	},

	focusItem: function(index) {
		if (this.index !== undefined) {
			this.get(this.index).emit('blur');
		}

		this.index = index;
		this.get(index).emit('focus');
		this.scrollTo(index);
	}
});
