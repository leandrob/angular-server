var fs = require('fs');
var async = require('async');

module.exports = function (moduleName) {
	moduleName = moduleName.toLowerCase();

	if (moduleName == 'common') {
		throw new Error('Common is not a valid name for a module!');
		return;
	};

	return function (req, res, next) {
		fs.readFile('./client-side/' + moduleName + '/views/index.html', function(err, data) {
			if (err) {
				next(Error.create('An error occurred trying load the view for ' + moduleName, null, err));
				return;
			}

			var steps = new Array();

			steps.push(function(cb) { return readFiles('common/filters', cb); });
			steps.push(function(cb) { return readFiles('common/directives', cb); });
			steps.push(function(cb) { return readFiles('common/services', cb); });
			steps.push(function(cb) { return readFiles('common/controllers', cb); });

			steps.push(function(cb) { return readFiles(moduleName + '/services', cb); });
			steps.push(function(cb) { return readFilesTwoLevels(moduleName + '/controllers', cb); });

			async.series(steps, function(err, results) {
				var filters = results[0] || new Array();
				var directives = results[1] || new Array();
				var commonServices = results[2] || new Array();
				var commonControllers = results[3] || new Array();

				var services = results[4] || new Array();
				var controllers = results[5] || new Array();

				var application = [
				'<script src="/common/module.js" type="text/javascript"></script>',
				'<script src="' + moduleName + '/routes.js" type="text/javascript"></script>',
				'<script src="' + moduleName + '/main.js" type="text/javascript"></script>'
				];

				data = data.toString().replace(/<%application%>/, application.join('\n'));

				data = data.toString().replace(/<%common.filters%>/, filters.join('\n'));
				data = data.toString().replace(/<%common.directives%>/, directives.join('\n'));
				data = data.toString().replace(/<%common.services%>/, commonServices.join('\n'));
				data = data.toString().replace(/<%common.controllers%>/, commonControllers.join('\n'));

				data = data.toString().replace(/<%services%>/, services.join('\n'));
				data = data.toString().replace(/<%controllers%>/, controllers.join('\n'));

				res.set('Content-Type', 'text/html');
				res.send(data);
			});
		});
	};
}

function readFiles (directoryName, cb) {
	var ignoreList = ['.DS_Store'];

	fs.readdir('./client-side/' + directoryName, function(err, files) { 
		// if (err) {
		// 	cb(Error.create('An error occurred trying to load ' + directoryName + '.', null, err));
		// 	return;
		// }

		if (err) {
			cb();
			return;
		};

		var scripts = files.filter(function(f) { return ignoreList.indexOf(f) == -1; }).map(function(f) {
			if (f.indexOf('.js') != -1) {
				return '<script src="' + directoryName + '/' + f + '" type="text/javascript"></script>';
			}

			return '<script src="' + directoryName + '/' + f + '/index.js" type="text/javascript"></script>';
		});

		cb(null, scripts);
	});
}

function readFilesTwoLevels (directoryName, cb) {
	var ignoreList = ['.DS_Store'];

	fs.readdir('./client-side/' + directoryName, function(err, files) { 
		if (err) {
			cb(Error.create('An error occurred trying to load ' + directoryName + '.', null, err));
			return;
		}

		/* Ignore List */
		files = files.filter(function(f) { return ignoreList.indexOf(f) == -1; });

		var scripts = files.filter(function(f) { return f.indexOf('.js') != -1; }).map(function(f) {
			return '<script src="' + directoryName + '/' + f + '" type="text/javascript"></script>';
		});

		var scriptsTwo = files.filter(function(f) { return f.indexOf('.js') == -1; });

		var steps = new Array();

		scriptsTwo.forEach(function(subdir) {
			steps.push(function(callback) {
				fs.readdir('./client-side/' + directoryName + '/' + subdir, function(err, files) {
					if (err) {
						callback(Error.create('An error occurred trying to load ' + directoryName + '/' + subdir + '.', null, err));
						return;
					}

					var finalScripts = files.map(function(f) { 
						return '<script src="' + directoryName + '/' + subdir + '/' + f + '" type="text/javascript"></script>';
					});

					callback(null, finalScripts);
				});
			});
		});

		async.parallel(steps, function(err, results) {
			if (err) {
				cb(err);
				return;
			};

			results.push(scripts);
			cb(null, flatten(results));
		});
	});
}

function flatten(arr) {
    var r = [];
    for (var i = 0; i < arr.length; ++i) {
        var v = arr[i];
        if (v instanceof Array) {
            Array.prototype.push.apply(arr, flatten(v));
        } else {1
            r.push(v);
        }
    }
    return r;
};