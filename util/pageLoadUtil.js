const tenants = require('../exampleData/tenant.json');

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

const getPageData = (page, pageData) => {
	switch (page) {
		case 'tenants':
			return tenants;
			break;
		case 'tenant':
			for (const tenant of tenants.tenants) {
				if (tenant.tenantID === parseInt(pageData)) {
					return {tenant};
				}
			}
			break;
		default:
			return;
	}
};

module.exports = {
	getRenderData
};