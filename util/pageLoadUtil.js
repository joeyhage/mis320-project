const tenants = require('../exampleData/tenant.json');
const sqlUtil = require('./sqlUtil');

const getRenderData = async (parent, page, client, pageData) => {
	const renderData = {
		parent,
		page,
		...getTemplateData(parent)
	};
	const results = await getPageData(page ? page : parent, client, pageData);
	return {
		...renderData,
		...results
	}
};
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
					href: '/tenants/search',
					page: 'search'
				}, {
					name: 'New Tenant',
					href: '/tenants/new',
					page: 'new'
				}]
			};
			break;
		case 'maintenance':
			return {
				title: 'Maintenance',
				subheadings: [{
					name: 'Work Orders',
					href: '/maintenance/work-orders',
					page: 'work-orders'
				}, {
					name: 'Purchase Orders',
					href: '/maintenance/purchase-orders',
					page: 'purchase-orders'
				}, {
					name: 'Vendors',
					href: '/maintenance/vendors',
					page: 'vendors'
				}],
			};
			break;
		case 'administration':
			return {
				title: 'Administration',
				subheadings: [{
					name: 'Billing',
					href: '/administration/billing',
					page: 'billing'
				}, {
					name: 'Employees',
					href: '/administration/employees',
					page: 'employees'
				}],
			};
			break;
		default:
			return;
	}
};

const getPageData = async (page, client, pageData) => {
	const lookupDataForPage = pageDataSwitch(client, pageData)[page];
	if (process.env.DEBUG) {
		console.log('pageData', pageData);
		console.log('lookupdataforpage', lookupDataForPage);
	}
	if (lookupDataForPage) {
		return await lookupDataForPage();
	}
};

const pageDataSwitch = (client, pageData) => ({
	'tenants': async () => {
		return await sqlUtil.getTenants(client);
	},
	'tenant': async () => {
		return await sqlUtil.getTenantByID(client, parseInt(pageData));
	},
	'search': async () => {
		return await sqlUtil.searchTenants(client, pageData)
	}
});

module.exports = {
	getRenderData
};