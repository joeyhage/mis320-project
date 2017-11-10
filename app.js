const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	{ getRenderData } = require('./util/pageLoadUtil'),
	{ createClient } = require('./util/sqlUtil');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));
app.use(bodyParser.json());
app.set('view engine', 'pug');

app.get('/*', async (req, res) => {
	let parent, page, view, match, pageData;
	if (req.path.match(/\/$/)) {
		parent = 'dashboard';
	} else if (req.path.match(/\/tenants\/?$/)) {
		parent = 'tenants';
	} else if (req.path.match(/\/tenants\/search/)) {
		parent = 'tenants';
		page = 'search';
		const searchQuery = req.param('searchQuery');
		if (!searchQuery) {
			return res.redirect('/tenants');
		}
		pageData = searchQuery;
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
	if (process.env.DEBUG) {
		console.log('Parent', parent);
		console.log('Page', page);
		console.log('View', view);
	}
	const client = await createClient();
	const renderData = await getRenderData(parent, page, client, pageData);
	await client.end();
	if (renderData.tenants && renderData.tenants.length === 1) {
		return res.redirect(`/tenants/${renderData.tenants[0].tenantid}`);
	}
	res.render(view, renderData);
});

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
