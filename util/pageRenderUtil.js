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
		case 'billing':
			return {
				title: 'Billing'
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
	'dashboard': async () => {
		const results = await Promise.all([
			sqlUtil.vacantUnits(),
			sqlUtil.unassignedMaintenanceOrders(),
			sqlUtil.lateRent()
		]);
		return {
			...results[0],
			...results[1],
			...results[2]
		};
	},
	'tenants': async () => {
		const results = await Promise.all([sqlUtil.getTenants(), sqlUtil.getPropertyNames()]);
		return results.reduce((accumulator, currentValue) => {
			const key = Object.keys(currentValue)[0];
			return {
				...accumulator,
				[key]: currentValue[key]
			};
		}, {formActionUrl: '/tenants/search'});
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
		}, {formActionUrl: '/tenants/search'});
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
	'maintenance': async () => {
		return await sqlUtil.openMaintenanceOrders();
	},
	'billing': async () => {
		const searchTenants = async () => {
			const results = await Promise.all([sqlUtil.searchTenants(pageData), sqlUtil.getPropertyNames()]);
			return results.reduce((accumulator, currentValue) => {
				const key = Object.keys(currentValue)[0];
				return {
					...accumulator,
					[key]: currentValue[key]
				};
			}, {});
		};
		const results = !pageData || pageData.hasOwnProperty('search') ? await searchTenants() : await sqlUtil.getBills(parseInt(pageData));
		return {...results, formActionUrl: '/billing'}
	}
});

module.exports = {
	getRenderData
};