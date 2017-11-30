const tenants = require('../exampleData/tenant.json');
const sqlUtil = require('./sqlUtil');

const getRenderData = async (parent, page, pageData, noQuery) => {
	const renderData = {
		parent,
		page,
		pageData,
		...getTemplateData(parent),
	};
	if (noQuery) {
		return renderData;
	}
	const results = await getPageData(page ? `${parent}/${page}` : parent, pageData);
	return {
		...renderData,
		...results
	};
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
				}, {
					name: 'Contacts',
					href: '/administration/contacts',
					page: 'contacts'
				}, {
					name: 'Notes',
					href: '/administration/notes',
					page: 'notes'
				}, {
					name: 'Pets',
					href: '/administration/pets',
					page: 'pets'
				}]
			};
			break;
		default:
			return;
	}
};

const getPageData = async (page, pageData) => {
	const queryPageData = pageDataSwitch(pageData)[page];
	if (process.env.DEBUG) {
		console.log('pageData', pageData);
		console.log('lookupdataforpage', queryPageData);
	}
	if (queryPageData) {
		return await queryPageData();
	}
};

const pageDataSwitch = pageData => ({
	'tenants': async () => {
		const results = await Promise.all([sqlUtil.getTenants(), sqlUtil.getPropertyNames()]);
		return results.reduce((accumulator, currentValue) => {
			const key = Object.keys(currentValue)[0];
			return {
				...accumulator,
				[key]: currentValue[key]
			};
		}, {});
	},
	'tenants/tenant': async () => {
		return await sqlUtil.getTenantByID(parseInt(pageData));
	},
	'tenants/search': async () => {
		const results = await Promise.all([sqlUtil.searchTenants(pageData), sqlUtil.getPropertyNames()]);
		return results.reduce((accumulator, currentValue) => {
			const key = Object.keys(currentValue)[0];
			return {
				...accumulator,
				[key]: currentValue[key]
			};
		}, {});
	},
	'employees': async () => {
		return await sqlUtil.getEmployees();
	},
	'employees/employee': async () => {
		return await sqlUtil.getEmployeeByID(parseInt(pageData));
	},
	'employees/search': async () => {
		return await sqlUtil.searchEmployees(pageData.search);
	},
	'administration/billing': async () => {
		return await sqlUtil.getBills();
	},
	'administration/contacts': async () => {
		return await sqlUtil.getContacts();
	}
});

module.exports = {
	getRenderData
};