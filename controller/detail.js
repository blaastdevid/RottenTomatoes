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

function getTotalHeight(controls) {
	var total = 0;
	controls.forEach(function each(item){
		total += item.dimensions().height;
	});
	total += 20;
	return total;
}


_.extend(exports, {
	':state': function(data) {
		console.log('star');
		var self = this;
		self.scrollTo(0);
		self.get('header').get('pic-box').clear();
		self.get('header').get('pic-box').add('pic', new ImageView({
			style: {
				width: 84,
				height: 99,
				mode: 'centered'
			}
		}));
		
		self.updateData = function(action, param){
			if(action === 'movie'){
				self.get('genre').label('Genre: ' + parseGenre(param.genres));
				self.get('director').label('Director: ' + parseDirector(param.abridged_directors));
				self.get('actors').label('Actors: ' + parseDirector(param.abridged_cast));
				app.removeListener('message', self.updateData);
			}else if (action === 'search'){
				self.get('header').get('pic-box').get('pic').resource('99/' + param.posters.detailed);
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
				app.removeListener('message', self.updateData);
			}
		};
		
		self.updateScreen = function() {
			app.msg('movie', {id: data.id});
			app.on('message', self.updateData);
			app.removeListener('connected', self.updateScreen);
			delete self.updateScreen;
		};
		app.on('connected', self.updateScreen);
		
		if(data.posters.detailed && data.title && data.year) {
			self.get('header').get('pic-box').get('pic').resource('99/' + data.posters.detailed);
			self.get('header').get('title-box').get('title').label(data.title);
			self.get('header').get('title-box').get('year').label(data.year);
			self.get('header').get('title-box').get('rating').label('Rating: ' + data.ratings.audience_score);
			self.get('plot').label('Plot: ' + data.synopsis);
			self.get('released').label('Released: ' + data.release_dates.theater);
			self.get('runtime').label('Runtime: ' + data.runtime);
			self.get('rated').label('Rated: ' + data.mpaa_rating);
		}
	},
	
	':inactive': function() {
		var self = this;
		app.removeListener('connected', self.updateScreen);
		delete self.updateScreen;
		app.removeListener('message', self.updateData);
		delete self.updateData;
	},
	
	':keypress': function(key) {
		var self = this;
		var totalHeight = getTotalHeight([
			self.get('header'),
			self.get('genre'),
			self.get('released'),
			self.get('runtime'),
			self.get('rated'),
			self.get('director'),
			self.get('actors'),
			self.get('plot')]);
		
		if (self.sct === undefined) {
			self.sct = 0;
			self.scrollTop(0, 1000);
		} else if (key === 'up' || key === 'down') {
			var next = self.sct + (key === 'up' ? 50 : -50);
			
			if (next > 0) {
				next = 0;
			} else if (next <= ((totalHeight - self.dimensions().height) * -1)) {
				next = ((totalHeight - self.dimensions().height) * -1);
			}
			self.sct = next;
			console.log(key + ' - ' + next + ' * ' + ((totalHeight - self.dimensions().height) * -1));
			self.scrollTop(next, 1000);
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
