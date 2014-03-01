var masterPageHandler = require('./masterPageHandler');
var publicHandler = require('./publicHandler');
var privateHandler = require('./privateHandler');

module.exports = function (api) {
	api.public = {};
	api.public.get = function (path, handler) { publicHandler(api, 'get', path, handler); }
	api.public.post = function (path, handler) { publicHandler(api, 'post', path, handler); }
	api.public.put = function (path, handler) { publicHandler(api, 'put', path, handler); }
	api.public.delete = function (path, handler) { publicHandler(api, 'delete', path, handler); }
	api.public.all = function (path, handler) { publicHandler(api, 'all', path, handler); }

	api.public.masterPage = function(path, viewName) {
		api.public.get(path, masterPageHandler(viewName));
	}

	api.private = {};
	api.private.get = function(path, handler) { privateHandler(api, 'get', path, handler); }
	api.private.post = function(path, handler) { privateHandler(api, 'post', path, handler); }
	api.private.put = function(path, handler) { privateHandler(api, 'put', path, handler); }
	api.private.delete = function(path, handler) { privateHandler(api, 'delete', path, handler); }
	api.private.all = function(path, handler) { privateHandler(api, 'all', path, handler); }
	
	api.private.masterPage = function(path, viewName) {
		api.private.get(path, masterPageHandler(viewName));
	} 
}