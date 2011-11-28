var _ = require('common/util');

var Single = require('../lib/single').Single;
var app = this;


_.extend(exports, {
	
	':load': function() {
		var self = this;
		
		app.on('message', function(action, param) {
			if (action === 'searchMovies') {
				self.get('content').clear();
				param.movies.forEach(function(movie) {
					if (!self.get(movie.id)) {
						self.get('content').add(movie.id, new Single(movie));
					}
				});
				
			}
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
			} else if (next > (this.get('content').size()-1)) {
				next = this.get('content').size()-1;
			}

			if (this.index === next) {
				return;
			}
			this.focusItem(next);
		} else if (key === 'fire') {
			this.get('content').get(this.index).emit('activate');
		}
	},

	focusItem: function(index) {
		var self = this;
		if (this.index !== undefined) {
			this.get('content').get(this.index).emit('blur');
		}
		this.index = index;
		this.get('content').get(index).emit('focus');
		self.calculateLength = function(index){
			var o = 0;
			var length = 0;
			for(o = 0; o <= index; o++){
				length = length + self.get('content').get(o).dimensions().height + 5;
			}
			return length;
		};
		
		var height = this.dimensions().height - 60;
		var value = 0;
		console.log(self.calculateLength(index));
		if(index === 0 || height > self.calculateLength(index)){
			this.get('content').scrollTop(0, 1000);
		} else if (height < self.calculateLength(index)){
			this.get('content').scrollTop(-1 * (self.calculateLength(index) - height), 1000);
		}
	}
});