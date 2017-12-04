const express = require('express'),
	app = express(),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	{ getRenderData } = require('./util/pageRenderUtil'),
	{ createTenant, createEmployee } = require('./util/sqlUtil'),
	pathUtil = require('./util/pathUtil');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));
app.use('/css', express.static(__dirname + '/node_modules/font-awesome/css/'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts/'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {maxAge: 60000}
}));

app.use((req, res, next) => {
	req.session.previousPage = req.session.page;
	resetPageInfo(req.session);
	if (req.method === 'POST') {
		return next();
	}
	let match;
	if (pathUtil.dashboardPath.test(req.path)) {
		req.session.parent = 'dashboard';
	} else if (pathUtil.tenantsPath.test(req.path)) {
		req.session.parent = 'tenants';
	} else if (pathUtil.tenantSearchPath.test(req.path)) {
		const search = req.query.search;
		const property = req.query.property;
		const tenantStatus = req.query.tenantStatus;
		if (search || property || tenantStatus || req.session.previousPage === 'search') {
			req.session.tenantSearch = search;
			req.session.property = property;
			req.session.tenantStatus = tenantStatus;
		} else if (!req.session.tenantSearch && !req.session.property && !req.session.tenantStatus) {
			req.session.redirectUrl = '/tenants';
			return next();
		}
		req.session.parent = 'tenants';
		req.session.page = 'search';
		req.session.pageData = {
			search: req.session.tenantSearch,
			property: req.session.property,
			tenantStatus: req.session.tenantStatus
		};
	} else if (match = req.path.match(pathUtil.tenantInfoPath)) {
		req.session.parent = 'tenants';
		req.session.page = 'tenant';
		req.session.pageData = match[1];
	} else if (match = req.path.match(pathUtil.tenantsSubpagePath)) {
		req.session.parent = 'tenants';
		req.session.page = match[1];
	} else if (pathUtil.employeesPath.test(req.path)) {
		req.session.parent = 'employees';
	} else if (pathUtil.employeeSearchPath.test(req.path)) {
		req.session.parent = 'employees';
		req.session.page = 'search';
		const search = req.query.search;
		if (search) {
			req.session.employeeSearch = search;
		} else if (!req.session.employeeSearch) {
			req.session.redirectUrl = '/employees';
			return next();
		}
		req.session.pageData = {
			search: req.session.employeeSearch
		};
	} else if (match = req.path.match(pathUtil.employeeInfoPath)) {
		req.session.parent = 'employees';
		req.session.page = 'employee';
		req.session.pageData = match[1];
	} else if (match = req.path.match(pathUtil.employeesSubpagePath)) {
		req.session.parent = 'employees';
		req.session.page = match[1];
	} else if (pathUtil.maintenancePath.test(req.path)) {
		req.session.parent = 'maintenance';
	} else if (match = req.path.match(pathUtil.maintenanceSubpagePath)) {
		req.session.parent = 'maintenance';
		req.session.page = match[1];
	} else if (pathUtil.billingPath.test(req.path)) {
		req.session.parent = 'billing';
		req.session.tenantSearch = req.query.search || '';
		req.session.property = req.query.property || '';
		req.session.tenantStatus = req.query.tenantStatus || '';
		req.session.pageData = {
			search: req.session.tenantSearch,
			property: req.session.property,
			tenantStatus: req.session.tenantStatus
		};
	} else if (match = req.path.match(pathUtil.billInfoPath)) {
		req.session.parent = 'billing';
		req.session.pageData = match[1];
	} else {
		req.session.redirectUrl = '/';
		return next();
	}
	req.session.view = `pages/${req.session.parent}${req.session.page ? '/' + req.session.page : ''}`;
	next();
});

app.get(pathUtil.simplePaths, async (req, res) => {
	if (req.session.redirectUrl) {
		return res.redirect(req.session.redirectUrl);
	}
	resetPersonInfo(req.session);
	const {parent, page, pageData, view} = req.session;
	const renderData = await getRenderData(parent, page, pageData);
	if (page === 'search' && (req.query.search || req.query.property || req.query.tenantStatus)) {
		if (renderData.tenants && renderData.tenants.length === 1) {
			const tenant = renderData.tenants[0];
			return res.redirect(`/tenants/${tenant.personid}`);
		} else if (renderData.employees && renderData.employees.length === 1) {
			const employee = renderData.employees[0];
			return res.redirect(`/employees/${employee.personid}`);
		}
	}
	if (process.env.DEBUG) {
		console.log(JSON.stringify(renderData));
	}
	res.render(view, renderData);
});

app.get([pathUtil.tenantInfoPath, pathUtil.employeeInfoPath] , async (req, res) => {
	const {parent, page, pageData, view, tenant, employee} = req.session;
	if (tenant) {
		const renderData = await getRenderData(parent, page, pageData, true);
		if (process.env.DEBUG) {
			console.log(JSON.stringify(renderData));
		}
		res.render(view, {...renderData, tenant});
	} else if (employee) {
		const renderData = await getRenderData(parent, page, pageData, true);
		if (process.env.DEBUG) {
			console.log(JSON.stringify(renderData));
		}
		res.render(view, {...renderData, employee});
	} else {
		const renderData = await getRenderData(parent, page, pageData);
		if (process.env.DEBUG) {
			console.log(JSON.stringify(renderData));
		}
		res.render(view, renderData);
	}
});

app.post('/tenants/new', async (req, res) => {
	const tenant = await createTenant(req.body);
	req.session.tenant = tenant;
	res.redirect(`/tenants/${tenant.tenantid}`);
});

app.post('/employees/new', async (req, res) => {
	const employee = await createEmployee(req.body);
	req.session.employee = employee;
	res.redirect(`/employees/${employee.employeeid}`);
});

const resetPageInfo = session => {
	session.parent = null;
	session.page = null;
	session.pageData = null;
	session.view = null;
	session.redirectUrl = null;
};

const resetPersonInfo = session => {
	session.tenant = null;
	session.employee = null;
};

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
