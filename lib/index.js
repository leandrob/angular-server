var express = require('express');
var http = require('http');
var path = require('path');
var apiExtensions = require('./apiExtensions');
var moduleLoader = require('./moduleLoader');

var server = module.exports;

server.start = function (config, cb) {
	if (typeof config == 'function') {
		cb = config;
		config = {};
	};

	var api = express();

	api.serverConfig = config;

	// Defaults 
	config.loginUrl = config.loginUrl || '/signin';
	config.port = config.port || 8000;
	config.sessionProvider = config.sessionProvider || express.session();
	config.cookieSecret = config.cookieSecret || 'notasecret';
	config.errorHandler = config.errorHandler || function(error, req, res, next) {
		var status = error.status || 500;
		var msg = error.message || 'Unknown error';

		var info = error.data || {};
		info.message = msg;

		res.json(status, info);
	}

	api.configure(function(){
		api.set('port', config.port);

		api.use(express.favicon());
		api.use(express.bodyParser());
		api.use(express.cookieParser(config.cookieSecret));
		api.use(config.sessionProvider);
		
		(config.middlewaresBeforeAuth || []).forEach(function(m) { api.use(m); });
		
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

		(config.middlewaresAfterAuth || []).forEach(function(m) { api.use(m); });

		api.use(express.static(path.join(process.env.PWD, 'client-side')));

		// App Extensions
		apiExtensions(api);

		// Load Modules
		moduleLoader.loadModules(api);

		// Errors
		api.use(config.errorHandler);
	});

	http
	.createServer(api)
	.listen(api.get('port'), cb);
}