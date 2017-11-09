const tenants = require('../exampleData/tenant.json');

const getRenderData = async (parent, page, pageData, client) => {
	const renderData = {
		parent,
		page,
		...getTemplateData(parent)
	};
	const results = await getPageData(page ? page : parent, pageData, client);
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

const getPageData = (page, pageData, client) => ({
	'tenants': async () => {
		await client.connect();
		const results = await client.query(
			'select * from person p, tenant t where p.personid=t.tenantid and person_type like \'%T%\''
		);
		await client.end();
		return {tenants: results.rows};
	},
	'tenant': async () => {
		await client.connect();
		const results = await client.query(
			'select * from person p, tenant t where p.personid=t.tenantid and t.tenantid=$1',
			[parseInt(pageData)]
		);
		await client.end();
		return {tenant: results.rows[0]};
	}
})[page]();

module.exports = {
	getRenderData
};