const tenantsQuery = (search, property, leaseStatus) => {
	const selectFrom = 'select * from person, tenant t';
	const where = ' where personid=t.tenantid';
	const orderBy = ' order by personid desc';
	const allTenants = ' left outer join (' +
		'select l.*, u.unit_number, property_name ' +
		'from lease l, unit u, property p ' +
		'where l.unitid=u.unitid and u.propertyid=p.propertyid and lease_status=\'Active\') ' +
		'lease on t.tenantid=lease.tenantid';
	const propertyQuery = getPropertyQuery(property);

	let query = selectFrom + (leaseStatus && leaseStatus !== 'Active' ? where : allTenants + where);
	const params = [];
	if (search) {
		query += getSearchQuery(search);
		params.push(`%${search}%`);
	}
	if (property) {
		query += getPropertyQuery(property, params.length + 1);
		params.push(property);
	}
	if (leaseStatus) {
		query += getLeaseStatusQuery(leaseStatus, params.length + 1);
		params.push(leaseStatus);
	}
	query += orderBy;

	return {query, params};
};

const getSearchQuery = search =>
	' and (lower(first_name) like $1 or lower(last_name) like $1 or phone_number like $1 or ' +
	'lower(email) like $1 or lower(first_name || \' \' || last_name) like $1)';

const getPropertyQuery = (property, nextParam) =>
	` and property_name=$${nextParam}`;

const getLeaseStatusQuery = (leaseStatus, nextParam) =>
	` and t.tenantid in (select tenantid from lease where lease_status=$${nextParam})`;

module.exports = {
	tenantsQuery
};