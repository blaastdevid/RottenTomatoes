var _ = require('common/util');
var ImageView = require('ui').ImageView;
var app = this;

_.extend(exports, {
	':load': function() {
		var self = this;
		
		self.selection = self.keySelectionWithItems([ 
				self.get('ibFilmName'), 
				self.get('button-box').get('bSearchContainer').get('bSearch')
			], {});
		
		self.get('ibFilmName').on('activate', function() {
			self.get('ibFilmName').emit('keypress', 'fire');
		});
		
		self.get('button-box').get('bSearchContainer').get('bSearch').on('activate', function() {
			app.pushView('searchList', {query: self.get('ibFilmName').value()});
		});
		
		app.on('message', function(action, data){
			if (action === 'searchMovies') {
				console.log('search');
				console.log(data);
			}
		});
	}
});
