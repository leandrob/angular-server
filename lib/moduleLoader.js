var fs = require('fs');
var path = require('path');

module.exports.loadModules = function(api) {

	console.log('> Loading modules...'.green)
	
	console.log('+ Loading index.js');
	require(path.join(process.env.PWD, './api/index.js')).init(api);

	var modules = fs.readdirSync(path.join(process.env.PWD, './api'))
	.filter(function (e) { return e.indexOf('.') == -1 && e.indexOf("api.") == -1; });

	modules.forEach(function(e) {
		console.log('+ Loading ' + e + '.');
		require(path.join(process.env.PWD, './api/') + e).init(api);
	});
}