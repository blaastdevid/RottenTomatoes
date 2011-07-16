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
var basicParam = {apikey: 'uygx44prkgbsefqhhzu6m224', country: 'id', _prettyprint: 'true'};

var debug = true;

function RottenTomatoesAPI(){
}

RottenTomatoesAPI.prototype = {
    request: function(what, url, param, cb) {
        var r = rlog.start(what);
        
        _.extend(param, basicParam);
        url = basicUrl + url + '?' + QS.stringify(param);
        console.log('Request: ' + url);
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
    
    upcoming: function(args){
        var self = this;
        this.api.upcoming(function(action, result) {
            self.client.msg(action, result);
        });
    },
    
    inTheaters: function(args){
        var self = this;
        this.api.inTheaters(function(action, result) {
            self.client.msg(action, result);
        });
    },
    
    opening: function(args) {
        var self = this;
        this.api.opening(function(action, result) {
            self.client.msg(action, result);
        });
    },
    
    boxOffice: function(args) {
        var self = this;
        this.api.boxOffice(function(action, result) {
            self.client.msg(action, result);
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
            self.client.msg(action, result);
        });
    }
};

app.message(function(client, action, args) {
    var self = this;
    if (action.length > 0 && RottenTomatoesUser.prototype.hasOwnProperty(action)) {
        app.debug(client.header() + ' action="' + action + '"');
        var user = new RottenTomatoesUser(client, new RottenTomatoesAPI());
        user[action].apply(user, [args]);
    } else {
        app.debug(client.header() + ' unknown-action="' + action + '"');
    }
});

app.setResourceHandler(function(request, response) {
    var r = rlog.start(request.id);

    function sendReply(response, error, imageType, data) {
        if (error) {
            r.error(error);
            response.failed();
        } else {
            r.done();
            response.reply(imageType, data);
        }
    }
    
    scaling.scale(request.id, request.display_width, request.display_height, 'image/jpeg',
        function(err, data) {
            sendReply(response, err, 'image/jpeg', data);
        }
    );
});
