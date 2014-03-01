module.exports = function (api, method, path, handler) {

	api[method](path, function (req, res, next) {
			// Not Authenticated
			if (!req.user) {
				// If ajax.
				if (req.xhr) {
					res.json(401, { message: 'You don\'t have a session opened'});
					return;
				}

				res.redirect(api.serverConfig.loginUrl);			
			};


			// Authenticated
			if (config.authzProvider) {

				api.serverConfig.authzProvider(req.user, function(authorized) {
						if (authorized) {
							handler(req, res, next);
							return;
						}

						// If ajax.
						if (req.xhr) {
							res.json(403, { message: 'You don\'t have permission to perform this action.'});
							return;
						}

						res.redirect(api.serverConfig.loginUrl)						
					});

				return;
			};

			handler(req, res, next);
		});
}

