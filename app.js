const express = require('express'),
	app = express(),
	{ Client } = require('pg'),
	{ getRenderData } = require('./util/pageLoadUtil');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));

app.set('view engine', 'pug');

app.get('/*', async (req, res) => {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	});
	let parent, page, view, match, pageData;
	if (req.path.match(/\/$/)) {
		parent = 'dashboard';
	} else if (req.path.match(/\/tenants\/?$/)) {
		parent = 'tenants';
	} else if (match = req.path.match(/\/tenants\/([0-9]+)\/?$/)) {
		parent = 'tenants';
		page = 'tenant';
		pageData = match[1];
	} else if (match = req.path.match(/\/tenants\/([a-z-]+)\/?$/)) {
		parent = 'tenants';
		page = match[1];
	} else if (req.path.match(/\/maintenance\/?$/)) {
		parent = 'maintenance';
	} else if (match = req.path.match(/\/maintenance\/([a-z-]+)\/?$/)) {
		parent = 'maintenance';
		page = match[1];
	} else if (req.path.match(/\/administration\/?$/)) {
		parent = 'administration';
	} else if (match = req.path.match(/\/administration\/([a-z-]+)\/?$/)) {
		parent = 'administration';
		page = match[1];
	} else {
		return res.redirect('/');
	}
	view = `pages/${parent}${page ? '/' + page : ''}`;
	const renderData = await getRenderData(parent, page, pageData, client);
	res.render(view, renderData);
});

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
