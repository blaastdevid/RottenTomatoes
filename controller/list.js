var Single = require('../lib/single').Single,
	_ = require('common/util');

var app = this;

_.extend(exports, {
	initialize: function(type) {
		var self = this;
		this.type  = type[0];
		self.userStorage = app.storage(self.type);		
	},

	':attached': function(param) {
		var self = this;
		
		this.parseMovies = function(action, args, flag) {
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
				
				if (!flag) {
					self.userStorage.remove('cache');
					self.userStorage.set('cache', args);
				}
			}
		};

		app.on('message', this.parseMovies);
		
		if (self.userStorage.get('cache')) {
			this.parseMovies(self.type, self.userStorage.get('cache'), true);
		}
	},
	
	clearUpdate: function() {
		if (this.updateMovies) {
			app.removeListener('connected', this.updateMovies);
			delete this.updateMovies;
		}
	},

	':active': function() {
		var self = this;

		this.updateMovies = function() {
			app.msg(self.type);
			self.clearUpdate();
		};

		if (!self.userStorage.get('cache')) {
			app.on('connected', this.updateMovies);
		} else {
			this.parseMovies(self.type, self.userStorage.get('cache'), true);
		}
	},

	':inactive': function() {
		this.clearUpdate();
		this.clear();
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
