const tenants = require('../exampleData/tenant.json');

const getRenderData = async (parent, page, pageData, connection) => {
	const renderData = {
		parent,
		page,
		...getTemplateData(parent)
	};
	const results = await getPageData(page ? page : parent, pageData, connection);
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

const getPageData = (page, pageData, connection) =>
	new Promise(resolve => {
		switch (page) {
			case 'tenants':
				connection.query(
					'select * from PERSON p, TENANT t where p.personid=t.tenantid and person_type like \'%T%\'',
					(error, results) => {
						return resolve({tenants: results});
					}
				);
				break;
			case 'tenant':
				connection.query(
					'select * from PERSON p, TENANT t where p.personid=t.tenantid and t.tenantid=?',
					[parseInt(pageData)],
					(error, results) => {
						return resolve({tenant: results[0]});
					}
				);
				break;
			default:
				return resolve();
		}
	})
;

module.exports = {
	getRenderData
};