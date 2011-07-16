var _ = require('common/util');
var ImageView = require('ui').ImageView;
var app = this;

function parseGenre(param) {
	var genres = '';
	param.forEach(function each(data){
		genres += data + ', ';
	});
	return genres.substring(0, genres.length - 2);
}

function parseDirector(param) {
	var directors = '';
	param.forEach(function each(data){
		directors += data.name + ', ';
	});
	return directors.substring(0, directors.length - 2);
}


_.extend(exports, {
	
	':load': function() {
		var self = this;
		self.selected = self.keySelectionWithItems([self.get('header').get('title-box').get('title'),
			self.get('header').get('title-box').get('year'),
			self.get('header').get('title-box').get('rating'),
			self.get('genre'),
			self.get('released'),
			self.get('runtime'),
			self.get('rated'),
			self.get('director'),
			self.get('actors'),
			self.get('plot')], {});
	},
	
	':state': function(data) {
		console.log('star');
		var self = this;
		self.get('header').get('pic-box').clear();
		self.get('header').get('pic-box').add('pic', new ImageView({
			style: {
				width: 84,
				height: 84
			}
		}));
		app.on('connected', function() {
			app.msg('movie', {id: data.id});
			
			app.on('message', function(action, param){
				if(action === 'movie'){
					self.get('genre').label('Genre: ' + parseGenre(param.genres));
					self.get('director').label('Director: ' + parseDirector(param.abridged_directors));
					self.get('actors').label('Actors: ' + parseDirector(param.abridged_cast));
				}else if (action === 'search'){
					self.get('header').get('pic-box').get('pic').resource(param.posters.detailed);
					self.get('header').get('title-box').get('title').label(param.title);
					self.get('header').get('title-box').get('year').label(param.year);
					self.get('header').get('title-box').get('rating').label('Rating: ' + param.ratings.audience_score);
					self.get('plot').label('Plot: ' + param.synopsis);
					self.get('released').label('Released: ' + param.release_dates.theater);
					self.get('runtime').label('Runtime: ' + param.runtime);
					self.get('rated').label('Rated: ' + data.mpaa_rating);
					self.get('genre').label('Genre: ' + parseGenre(param.genres));
					self.get('director').label('Director: ' + parseDirector(param.abridged_directors));
					self.get('actors').label('Actors: ' + parseDirector(param.abridged_cast));
				}
			});
		});
		if(data.posters.detailed && data.title && data.year) {
			self.get('header').get('pic-box').get('pic').resource(data.posters.detailed);
			self.get('header').get('title-box').get('title').label(data.title);
			self.get('header').get('title-box').get('year').label(data.year);
			self.get('header').get('title-box').get('rating').label('Rating: ' + data.ratings.audience_score);
			self.get('plot').label('Plot: ' + data.synopsis);
			self.get('released').label('Released: ' + data.release_dates.theater);
			self.get('runtime').label('Runtime: ' + data.runtime);
			self.get('rated').label('Rated: ' + data.mpaa_rating);
		}
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