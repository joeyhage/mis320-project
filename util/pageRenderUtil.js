const tenants = require('../exampleData/tenant.json');
const sqlUtil = require('./sqlUtil');

const getRenderData = async (parent, page, pageData, client) => {
	const renderData = {
		parent,
		page,
		pageData,
		...getTemplateData(parent),
	};
	if (client) {
		const results = await getPageData(page ? `${parent}/${page}` : parent, client, pageData);
		return {
			...renderData,
			...results
		};
	} else {
		return renderData;
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
		case 'employees':
			return {
				title: 'Employees',
				subheadings: [{
					name: 'Search',
					href: '/employees/search',
					page: 'search'
				}, {
					name: 'New Employee',
					href: '/employees/new',
					page: 'new'
				}]
			};
			break;
		case 'maintenance':
			return {
				title: 'Maintenance',
				subheadings: [{
					name: 'Requests',
					href: '/maintenance/requests',
					page: 'requests'
				}, {
					name: 'Orders',
					href: '/maintenance/orders',
					page: 'orders'
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
				}]
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
		const results = await Promise.all([sqlUtil.getTenants(client), sqlUtil.getPropertyNames(client)]);
		return results.reduce((accumulator, currentValue) => {
			const key = Object.keys(currentValue)[0];
			return {
				...accumulator,
				[key]: currentValue[key]
			};
		}, {});
	},
	'tenants/tenant': async () => {
		return await sqlUtil.getTenantByID(client, parseInt(pageData));
	},
	'tenants/search': async () => {
		const results = await Promise.all([sqlUtil.searchTenants(client, pageData), sqlUtil.getPropertyNames(client)]);
		return results.reduce((accumulator, currentValue) => {
			const key = Object.keys(currentValue)[0];
			return {
				...accumulator,
				[key]: currentValue[key]
			};
		}, {});
	},
	'employees': async () => {
		return await sqlUtil.getEmployees(client);
	},
	'employees/employee': async () => {
		return await sqlUtil.getEmployeeByID(client, parseInt(pageData));
	},
	'employees/search': async () => {
		return await sqlUtil.searchEmployees(client, pageData.search);
	}
});

module.exports = {
	getRenderData
};