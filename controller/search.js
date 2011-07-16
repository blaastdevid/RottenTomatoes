var _ = require('common/util');
var ImageView = require('ui').ImageView;
var app = this;

_.extend(exports, {
	':load': function() {
		var self = this;
		
		self.selection = self.keySelectionWithItems([ 
				self.get('ibFilmName'), 
				self.get('button-box').get('bSearch')
			], 
			{
				focusedCallback: function(item) {
					if (item instanceof ImageView) {
						self.get('button-box').get('bSearch').src(app.resourceURL('search_ho.png'));
					} else {
						self.get('button-box').get('bSearch').src(app.resourceURL('search.png'));
					}
					
				}
			});
		
		self.get('button-box').get('bSearch').src(app.resourceURL('search_ho.png'));
		self.get('button-box').get('bSearch').src(app.resourceURL('search.png'));
		
		self.get('ibFilmName').on('activate', function() {
			self.get('ibFilmName').emit('keypress', 'fire');
		});
		
		self.get('button-box').get('bSearch').on('activate', function() {
			//app.msg('searchMovies', {query: self.get('ibFilmName').value()});
			app.setContent('searchList', {query: self.get('ibFilmName').value()});
		});
		app.on('connected', function() {
			console.log('Connected to backend.');
			
			app.on('message', function(action, data){
				if (action === 'searchMovies') {
					console.log('search');
					console.log(data);
				}
			});
		});
	}
});
