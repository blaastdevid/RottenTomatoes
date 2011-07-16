var _ = require('common/util');

var Single = require('../lib/single').Single;
var app = this;


_.extend(exports, {
	
	':load': function() {
		var self = this;
		
		app.on('connected', function() {
			app.on('message', function(action, param) {
				if (action === 'searchMovies') {
					self.clear();
					param.movies.forEach(function(movie) {
						if (!self.get(movie.id)) {
							self.add(movie.id, new Single(movie));
						}
					});
					
				}
			});
		});
	},
	
	':state': function(data) {
		app.msg('searchMovies', data);		
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