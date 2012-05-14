// RottenTomatoes -- backend.js

var ReqLog  = require('blaast/mark').RequestLogger;
var Scaling = require('blaast/scaling').Scaling;
var QS = require('querystring');
var _  = require('underscore');
var http = require('blaast/simple-http');
var sys = require('sys');

var rlog = new ReqLog(app.log);
var scaling = new Scaling(app.config);

var basicUrl = 'http://api.rottentomatoes.com/api/public/v1.0/';
var basicParam = {apikey: 'uygx44prkgbsefqhhzu6m224', country: 'id', _prettyprint: 'false'};

var debug = false;   

function RottenTomatoesAPI(){
}

RottenTomatoesAPI.prototype = {
    request: function(what, url, param, cb) {
        var r = rlog.start(what);
        
        _.extend(param, basicParam);
        url = basicUrl + url + '?' + QS.stringify(param);
        if(debug) {
            console.log('Request: ' + url);
        }
        http.get(url, {
            ok: function(data) {
                if(debug) {
                    console.log(data);
                }
                r.done();
		cb(what, JSON.parse(data));
            },
            error: function(err) {
                r.error(err);
		cb(what, err);
            }
        });
    },
    
    upcoming: function(cb){
        this.request('upcoming', 'lists/movies/upcoming.json', {page_limit: 10}, cb);
    },
    
    inTheaters: function(cb){
        this.request('inTheaters', 'lists/movies/in_theaters.json', {page_limit: 10}, cb);
    },
    
    opening: function(cb) {
        this.request('opening', 'lists/movies/opening.json', {limit: 10}, cb);
    },
    
    boxOffice: function(cb) {
        this.request('boxOffice', 'lists/movies/box_office.json', {page_limit: 10}, cb);
    },
    
    movie: function(id, cb) {
        this.request('movie', 'movies/' + id + '.json', {}, cb);
    },
    
    searchMovies: function(query, cb) {
        this.request('searchMovies', 'movies.json', {page_limit: 10, q: query}, cb);
    }    
};

function RottenTomatoesUser(client, api){
    this.client = client;
    this.api = api;
}

RottenTomatoesUser.prototype = {
    
    _manageResult: function(result) {
	delete result.link_template;
	delete result.links;
	delete result.total;
	result.movies.forEach(function(movie){
	    delete movie.links;
	    delete movie.alternate_ids;
	    delete movie.abridged_cast;
	    delete movie.posters.profile;
	    delete movie.posters.original;
	    delete movie.critics_consensus;
	});
	return result;
    },
    
    upcoming: function(args){
        var self = this;
        this.api.upcoming(function(action, result) {
            self.client.msg(action, self._manageResult(result));
        });
    },
    
    inTheaters: function(args){
        var self = this;
        this.api.inTheaters(function(action, result) {
            self.client.msg(action, self._manageResult(result));
        });
    },
    
    opening: function(args) {
        var self = this;
        this.api.opening(function(action, result) {
            self.client.msg(action, self._manageResult(result));
        });
    },
    
    boxOffice: function(args) {
        var self = this;
        this.api.boxOffice(function(action, result) {
            self.client.msg(action, self._manageResult(result));
        });
    },
    
    movie: function(args) {
        var self = this;
        this.api.movie(args.id, function(action, result) {
            self.client.msg(action, result);
        });
    },
    
    searchMovies: function(args) {
        var self = this;
        this.api.searchMovies(args.query, function(action, result) {
            self.client.msg(action, self._manageResult(result));
        });
    }
};

app.message(function(client, action, args) {
    var self = this;
    if (action && action.length > 0 && RottenTomatoesUser.prototype.hasOwnProperty(action)) {
        app.debug(client.header() + ' action="' + action + '"');
        var user = new RottenTomatoesUser(client, new RottenTomatoesAPI());
        user[action].apply(user, [args]);
    } else {
        app.debug(client.header() + ' unknown-action="' + action + '"');
    }
});

app.setResourceHandler(function(request, response) {
    var url = request.id.substring(3);
    var length = parseInt(request.id.substring(0,3), 0);
    
    var r = rlog.start(url);

    function sendReply(response, error, imageType, data) {
        if (error) {
            r.error(error);
            response.failed();
        } else {
            r.done();
            response.reply(imageType, data);
        }
    }
    scaling.scale(url, length, length, 'image/jpeg',
        function(err, data) {
            sendReply(response, err, 'image/jpeg', data);
        }
    );
});
