var ui = require('ui'),
	ImageView = ui.ImageView,
	TextView = ui.TextView,
	HLayout = ui.HLayout,
	VLayout = ui.VLayout,
	_ = require('common/util');

var PIC_SIZE = 24;

var app = this;

function splitString(synopsis){
	return synopsis.substring(0, 157) + '...';
}

var Single = VLayout.extend({
	initialize: function(data) {
		Single.__super__.initialize.call(this, {
			style: {
				width: 'fill-parent',
				border: '5 10 5 10',
				padding: 5
			}
		});
		

		this.data = data;

		var icon = new ImageView({
			style: {
				width: PIC_SIZE,
				height: PIC_SIZE
			}
		});

		icon.setResource(data.posters.thumbnail);

		this.add(icon);

		var box = new HLayout({
			style: {
				width: 'fill-parent'
			}
		});

		var titleBox = new VLayout({
			style: {
				width: 'fill-parent',
				padding: 5
			}
		});

		var title = new TextView({
			label: data.title,
			style: {
				'font-weight': 'bold',
				'font-size': 'small',
				width: 'fill-parent',
				valign: 'middle',
				color: '#3dccff'
			}
		});

		var year = new TextView({
			label: data.year,
			style: {
				'font-size': 'small',
				height: 16,
				valign: 'middle',
				color: '#bdadad'
			}
		});
		
		titleBox.add(title).add(year);

		box.add(titleBox);

		box.add(new TextView({
			label: splitString(data.synopsis),
			style: {
				'font-size': 'small',
				color: 'black'
			}
		}));
		 
		this.add(box);
	},

	':blur': function() {
		this.style({
			'background-color': 'transparent'
		});
	},

	':focus': function() {
		this.style({
			'background-color': '#ccf3fd'
		});
	},

	':activate': function() {
		app.setContent('detail', this.data);
	}
});

exports.Single = Single;
