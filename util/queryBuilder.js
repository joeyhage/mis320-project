const tenantsQuery = (search, property, tenantStatus) => {
	const selectFrom = 'select * from person, tenant t';
	const where = ' where personid=t.tenantid';
	const orderBy = ' order by personid desc';
	const allTenants = ' left outer join (' +
		'select l.*, u.unit_number, property_name ' +
		'from lease l, unit u, property p ' +
		'where l.unitid=u.unitid and u.propertyid=p.propertyid and lease_status=\'Active\') ' +
		'lease on t.tenantid=lease.tenantid';

	let query = selectFrom + (tenantStatus && tenantStatus !== 'Current' ? where : allTenants + where);
	const params = [];
	if (search) {
		query += getSearchQuery(search);
		params.push(`%${search}%`);
	}
	if (property) {
		query += getPropertyQuery(params.length + 1);
		params.push(property);
	}
	if (tenantStatus) {
		query += getLeaseStatusQuery(params.length + 1);
		params.push(tenantStatus === 'Current' ? 'Active' : (tenantStatus === 'Past' ? 'Complete' : 'Pending'));
	}
	query += orderBy;

	return {query, params};
};

const getSearchQuery = search =>
	' and (lower(first_name) like $1 or lower(last_name) like $1 or phone_number like $1 or ' +
	'lower(email) like $1 or lower(first_name || \' \' || last_name) like $1)';

const getPropertyQuery = paramIndex =>
	` and property_name=$${paramIndex}`;

const getLeaseStatusQuery = paramIndex =>
	` and t.tenantid in (select tenantid from lease where lease_status=$${paramIndex})`;

module.exports = {
	tenantsQuery
};