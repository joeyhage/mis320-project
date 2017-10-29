const express = require('express'),
	app = express(),
	tenants = require('./public/exampleData/tenants.json');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));

app.set('view engine', 'pug');

app.get('/*', (req, res) => {
	let parent, page, view, match, pageData;
	if (req.path.match(/\/$/)) {
		parent = 'dashboard';
	} else if (req.path.match(/\/tenants\/?$/)) {
		parent = 'tenants';
	} else if (match = req.path.match(/\/tenants\/([0-9]+)\/?$/)) {
		parent = 'tenants';
		page = 'tenant';
		pageData = match[1];
	} else if (req.path.match(/\/admin\/?$/)) {
		parent = 'administration';
	} else if (match = req.path.match(/\/admin\/([a-z]+)\/?$/)) {
		parent = 'administration';
		page = match[1];
	} else {
		return res.redirect('/');
	}
	view = `pages/${parent}${page ? '/' + page : ''}`;
	res.render(view, getRenderData(parent, page, pageData));
});

const getRenderData = (parent, page, pageData) => ({
	parent,
	page,
	...getTemplateData(parent),
	...getPageData(page ? page : parent, pageData)
});

const getTemplateData = parent => {
	switch (parent) {
		case 'dashboard':
			return {
				title: 'Dashboard'
			};
			break;
		case 'tenants':
			return {
				title: 'Tenants',
				subheadings: [{
					name: 'Search',
					href: '/tenants',
					page: 'tenants'
				}]
			};
			break;
		case 'administration':
			return {
				title: 'Administration',
				subheadings: [{
					name: 'Billing',
					href: '/admin/billing',
					page: 'billing'
				}],
			};
			break;
		default:
			return;
	}
};

const getPageData = (page, pageData) => {
	switch (page) {
		case 'tenants':
			return tenants;
			break;
		case 'tenant':
			for (tenant of tenants.tenants) {
				if (tenant.tenantID === pageData) {
					return tenant;
				}
			}
			break;
		default:
			return;
	}
};

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
