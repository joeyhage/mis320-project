const tenantsQuery = (search, property, tenantStatus) => {
	const selectFrom = 'select * from person, tenant t';
	const where = ' where personid=t.tenantid';
	const orderBy = ' order by personid desc';
	const allTenants = ' left outer join (' +
		'select l.*, u.unit_number, property_name ' +
		'from lease l, unit u, property p ' +
		'where l.unitid=u.unitid and u.propertyid=p.propertyid and lease_status=\'Active\') ' +
		'lease on t.tenantid=lease.tenantid';

	let query = selectFrom + (tenantStatus && tenantStatus !== 'Current Tenant' ? where : allTenants + where);
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
		params.push(tenantStatus === 'Current Tenant' ? 'Active' : (tenantStatus === 'Past' ? 'Complete' : 'Pending'));
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

const tenantInfo = tenantID => ({
	query: 'select * from person, tenant where personid=tenantid and tenantid=$1',
	params: [tenantID]
});

const tenantLeases = tenantID => ({
	query: 'select * from lease l, unit u, property p where l.unitid=u.unitid and u.propertyid=p.propertyid and tenantid=$1 ' +
	'order by lease_start_date desc',
	params: [tenantID]
});

const tenantContacts = tenantID => ({
	query: 'select * from contact where tenantid=$1',
	params: [tenantID]
});

const tenantParkingPermits = tenantID => ({
	query: 'select v.*, pp.*, property_name from vehicle v, parking_permit pp, property p where v.plate_no=pp.plate_no ' +
	'and p.propertyid=pp.propertyid and personid=$1 order by effective_date desc;',
	params: [tenantID]
});

const tenantPets = tenantID => ({
	query: 'select * from pet where tenantid=$1 order by pet_startdate desc',
	params: [tenantID]
});

const tenantNotes = tenantID => ({
	query: 'select * from note where personid=$1 order by note_date desc',
	params: [tenantID]
});

const tenantServiceRequests = tenantID => ({
	query: 'select * from service_request where tenantid=$1 order by request_create_date desc',
	params: [tenantID]
});

const tenantBills = tenantID => ({
	query: 'select due_date, payment_date, sum(expense_amount) as bill_amount from tenant_bill tb, bill_line_item bli, tenant_expense te ' +
	'where tb.billid=bli.billid and bli.expenseid=te.expenseid and tenantid=$1 group by tenantid, due_date, payment_date order by due_date desc;',
	params: [tenantID]
});

module.exports = {
	tenantsQuery,
	tenantInfo,
	tenantLeases,
	tenantContacts,
	tenantParkingPermits,
	tenantPets,
	tenantNotes,
	tenantServiceRequests,
	tenantBills
};