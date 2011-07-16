var panels = require('ui/panels'),
	_ = require('common/util'),
	TextView = require('ui').TextView;

var app = this;

var HomePanels = panels.Panels.extend({
	initialize: function() {
		HomePanels.__super__.initialize.call(this);		
		
		this.add('Box Office', app.newView('list', 'boxOffice'));
		this.add('Upcoming', app.newView('list', 'upcoming'));
		this.add('In Theaters', app.newView('list', 'inTheaters'));
		this.add('Opening', app.newView('list', 'opening'));
		this.add('Search', 'search');
	}
});

this.defineControl('HomePanels', HomePanels);


_.extend(exports, {
	':load': function() {
		var self = this;		
		
		app.on('connected', function() {
			console.log('Connected to backend.');	
			
			app.on('message', function(action, data){
				if (action === 'search') {
					console.log(data.Title);
					if (data.Response === 'True') {
						app.setContent('detail', data);
					}else if (data.Response === 'Parse Error') {
						//if error do something
						console.log('failed to get the data');
					}
				}
			});
		});
	},

	':resized': function(width, height) {
		console.log('View was resized to ' + width + 'x' + height);
	},

	':keypress': function(key) {
		this.get(0)[':keypress'](key);
	},

	':active': function() {
		console.log('View is active');
	},

	':inactive': function() {
		console.log('View is inactive');
	}
});
