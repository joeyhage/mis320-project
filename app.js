const express = require('express'),
	app = express(),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	{ getRenderData, getTemplateData } = require('./util/pageRenderUtil'),
	{ createClient } = require('./util/sqlUtil');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));
app.use(bodyParser.json());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 60000}
}));

app.use((req, res, next) => {
	resetSession(req.session);
	let match;
	if (/^(\/)?$/.test(req.path)) {
		req.session.parent = 'dashboard';
	} else if (/^\/tenants(\/)?$/.test(req.path)) {
		req.session.parent = 'tenants';
	} else if (/^\/tenants\/search(\/)?$/.test(req.path)) {
		req.session.parent = 'tenants';
		req.session.page = 'search';
		const searchQuery = req.query.searchQuery;
		if (searchQuery) {
			req.session.tenantSearch = searchQuery;
		} else if (!req.session.tenantSearch) {
			req.session.redirectUrl = '/tenants';
			return next();
		}
		req.session.pageData = req.session.tenantSearch;
	} else if (match = req.path.match(/^\/tenants\/([0-9]+)(\/)?$/)) {
		req.session.parent = 'tenants';
		req.session.page = 'tenant';
		req.session.pageData = match[1];
	} else if (match = req.path.match(/^\/tenants\/([a-z-]+)(\/)?$/)) {
		req.session.parent = 'tenants';
		req.session.page = match[1];
	} else if (/^\/employees(\/)?$/.test(req.path)) {
		req.session.parent = 'employees';
	} else if (/^\/employees\/search(\/)?/.test(req.path)) {
		req.session.parent = 'employees';
		req.session.page = 'search';
		const searchQuery = req.query.searchQuery;
		if (searchQuery) {
			req.session.employeeSearch = searchQuery;
		} else if (!req.session.employeeSearch) {
			req.session.redirectUrl = '/employees';
			return next();
		}
		req.session.pageData = req.session.employeeSearch;
	} else if (match = req.path.match(/^\/employees\/([0-9]+)(\/)?$/)) {
		req.session.parent = 'employees';
		req.session.page = 'employee';
		req.session.pageData = match[1];
	} else if (match = req.path.match(/^\/employees\/([a-z-]+)(\/)?$/)) {
		req.session.parent = 'employees';
		req.session.page = match[1];
	} else if (/^\/maintenance(\/)?$/.test(req.path)) {
		req.session.parent = 'maintenance';
	} else if (match = req.path.match(/^\/maintenance\/([a-z-]+)(\/)?$/)) {
		req.session.parent = 'maintenance';
		req.session.page = match[1];
	} else if (/^\/administration(\/)?$/.test(req.path)) {
		req.session.parent = 'administration';
	} else if (match = req.path.match(/^\/administration\/([a-z-]+)(\/)?$/)) {
		req.session.parent = 'administration';
		req.session.page = match[1];
	} else {
		req.session.redirectUrl = '/';
		return next();
	}
	req.session.view = `pages/${req.session.parent}${req.session.page ? '/' + req.session.page : ''}`;
	next();
});

app.get('/*', async (req, res) => {
	if (req.session.redirectUrl) {
		return res.redirect(req.session.redirectUrl);
	}
	const {parent, page, pageData} = req.session;
	let {view} = req.session;
	if (req.session.tenant) {
		const renderData = {
			parent,
			page,
			...getTemplateData(parent),
			tenant: req.session.tenant
		};
		req.session.tenant = null;
		if (process.env.DEBUG) {
			console.dir(renderData);
		}
		res.render(view, renderData);
	} else if (req.session.employee) {
		const renderData = {
			parent,
			page,
			...getTemplateData(parent),
			employee: req.session.employee
		};
		req.session.employee = null;
		if (process.env.DEBUG) {
			console.dir(renderData);
		}
		res.render(view, renderData);
	} else {
		const client = await createClient();
		const renderData = await getRenderData(parent, page, client, pageData);
		await client.end();
		if (page === 'search' && req.query.searchQuery) {
			if (renderData.tenants && renderData.tenants.length === 1) {
				req.session.tenant = renderData.tenants[0];
				return res.redirect(`/tenants/${req.session.tenant.tenantid}`);
			} else if (renderData.employees && renderData.employees.length === 1) {
				req.session.employee = renderData.employees[0];
				return res.redirect(`/employees/${req.session.employee.employeeid}`);
			}
		}
		if (process.env.DEBUG) {
			console.dir(renderData);
		}
		res.render(view, renderData);
	}
});

const resetSession = session => {
	session.parent = null;
	session.page = null;
	session.pageData = null;
	session.view = null;
	session.redirectUrl = null;
};

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
