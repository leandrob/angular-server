module.exports = function (api, method, path, handler) {
	api[method](path, function(req, res, next) {
		// if (req.session.user && req.url == app.config.auth.loginPage) {
		// 	res.redirect('/');
		// 	return;
		// };

		handler(req, res, next);
	});
}