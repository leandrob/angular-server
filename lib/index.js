var express = require('express');
var http = require('http');
var path = require('path');
var apiExtensions = require('./apiExtensions');
var moduleLoader = require('./moduleLoader');

var server = module.exports;

server.start = function (config, cb) {
	var api = express();

	api.serverConfig = config;

	api.configure(function(){
		api.set('port', config.port);

		api.use(express.favicon());
		api.use(express.bodyParser());
		api.use(express.cookieParser(config.cookieSecret || 'notasecret'));
		api.use(config.sessionProvider || express.session());
		
		if (config.authProvider) {
			api.use(function(req, res, next) {

				if (req.session.user) {
					req.user = req.session.user;
					next();
					return;
				};

				config.authProvider(req, function(err, user) {
					if (err || !user) {
						res.send(401);
						return;
					};

					req.user = user;
					req.session.user = user;
					next();
				});
			});
		};

		(config.middlewares || []).forEach(function(m) { api.use(m); });

		api.use(express.static(path.join(process.env.PWD, 'client-side')));

		// App Extensions
		apiExtensions(api);

		// Load Modules
		moduleLoader.loadModules(api);

		// Errors
		api.use(config.errorHandler || function(error, req, res, next) {
			var status = error.status || 500;
			var msg = error.message || 'Unknown error';

			var info = error.data || {};
			info.message = msg;

			res.json(status, info);
		});
	});

	http
	.createServer(api)
	.listen(api.get('port'), cb);
}