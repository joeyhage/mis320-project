const queryBuilder = require('./queryBuilder');

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});

const query = async (connection, queryString, params) => {
	const {rows} = await connection.query(queryString, params);
	return rows;
};

const clientQuery = async (queryString, params) => {
	let client;
	try {
		client = await pool.connect();
		return await query(client, queryString, params);
	} catch (err) {
		console.error(new Error(err), queryString, params);
	} finally {
		client.release();
	}
};

const poolQuery = async (queryString, params) => {
	try {
		return await query(pool, queryString, params);
	} catch (err) {
		console.error(new Error(err), queryString, params);
	}
};

const getTenants = async () => {
	const tenantsQuery = queryBuilder.tenantsQuery();
	const rows = await poolQuery(tenantsQuery.query);
	setTenantStatus(rows);
	return {tenants: rows};
};

const getTenantByID = async tenantID => {
	return await promiseMapAll({
		tenant: async () => {
			const {query, params} = queryBuilder.tenantInfo(tenantID);
			const tenantResult = await clientQuery(query, params);
			return tenantResult[0];
		},
		leasing: async () => {
			const {query, params} = queryBuilder.tenantLeases(tenantID);
			return await clientQuery(query, params);
		},
		contacts: async () => {
			const {query, params} = queryBuilder.tenantContacts(tenantID);
			return await clientQuery(query, params);
		},
		parking: async () => {
			const {query, params} = queryBuilder.tenantParkingPermits(tenantID);
			return await clientQuery(query, params);
		},
		pets: async () => {
			const {query, params} = queryBuilder.tenantPets(tenantID);
			return await clientQuery(query, params);
		},
		notes: async () => {
			const {query, params} = queryBuilder.tenantNotes(tenantID);
			return await clientQuery(query, params);
		},
		service_requests: async () => {
			const {query, params} = queryBuilder.tenantServiceRequests(tenantID);
			return await clientQuery(query, params);
		},
		bills: async () => {
			const {query, params} = queryBuilder.tenantBills(tenantID);
			return await clientQuery(query, params);
		}
	});
};

const searchTenants = async ({search, property, tenantStatus}) => {
	const formattedSearchQuery = formatSearchQuery(search);
	const {query, params} = queryBuilder.tenantsQuery(formattedSearchQuery, property, tenantStatus);
	const rows = await poolQuery(query, params);
	setTenantStatus(rows);
	if (process.env.DEBUG) {
		console.log('sqlUtil - searchTenants');
		console.log(JSON.stringify(rows));
	}
	return {tenants: rows};
};

const getEmployees = async () => {
	const rows = await poolQuery(
		'select * from person, employee e ' +
		'left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and job_end_date is null ' +
		'order by personid desc'
	);
	return {employees: rows};
};

const getEmployeeByID = async employeeID => {
	return await promiseMapAll({
		employee: async () => {
			const rows = await clientQuery(
				'select * from person, employee e left outer join job j on j.employeeid=e.employeeid ' +
				'where personid=e.employeeid and e.employeeid=$1 and job_end_date is null',
				[employeeID]
			);
			return rows[0];
		},
		jobs: async () => {
			return await clientQuery(
				'select * from job where employeeid=$1 order by job_start_date desc',
				[employeeID]
			);
		}
	});
};

const searchEmployees = async searchQuery => {
	const formattedSearchQuery = formatSearchQuery(searchQuery);
	const rows = await poolQuery(
		'select * from person, employee e ' +
		'left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and job_end_date is null and (' +
		'lower(first_name) like $1 or lower(last_name) like $1 or job_title like $1 ' +
		'or lower(first_name || \' \' || last_name) like $1)' +
		'order by personid desc',
		[`%${formattedSearchQuery}%`]
	);
	return {employees: rows};
};

const getPropertyNames = async () => {
	const rows = await poolQuery(
		'select property_name from property'
	);
	return {properties: rows};
};

const createPerson = async (person, isTenant, isEmployee) => {
	return await poolQuery(
		'insert into person values (default,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *',
		[person.firstName, person.lastName, person.phone1 + person.phone2 + person.phone3,
			person.dob, person.ssn1 + person.ssn2 + person.ssn3, person.email,
			person.streetAddress, person.city, person.state, person.zipcode, isTenant, isEmployee]
	);
};

const createTenant = async tenant => {
	const personResult = await createPerson(tenant, true, false);
	const tenantResult = await poolQuery(
		'insert into tenant values ($1,$2) returning *',
		[personResult[0].personid, tenant.annualIncome]
	);

	return {
		...personResult[0],
		...tenantResult[0]
	};
};

const createEmployee = async employee => {
	const personResult = await createPerson(employee, false, true);
	const employeeResult = await poolQuery(
		'insert into employee values ($1,$2) returning *',
		[personResult[0].personid, employee.dateOfHire]
	);

	return {
		...personResult[0],
		...employeeResult[0]
	};
};

const getBills = async () => {
	const rows = await poolQuery(
		'select tb.billid, due_date, payment_date, expense_amount, frequency, expense_description, new.bill_amount ' +
		'from tenant_bill tb, bill_line_item bli, tenant_expense te, (' +
		'select tb.billid, sum(expense_amount) as bill_amount ' +
		'from tenant_bill tb, bill_line_item bli, tenant_expense te ' +
		'where tb.billid=bli.billid and bli.expenseid=te.expenseid group by tb.billid) new ' +
		'where tb.billid=bli.billid and bli.expenseid=te.expenseid and tb.billid=new.billid order by due_date desc'
	);
	const billing = [];
	for (const row of rows) {
		let found = false;
		for (const bill of billing) {
			if (row.billid === bill[0].billid) {
				found = true;
				bill.push(row);
			}
		}
		if (!found || !billing || !billing.length) {
			billing.push([row]);
		}
	}
	return {billing};
};

const getContacts = async () => {
	const rows = await poolQuery(
		'select (tp.first_name || \' \' || tp.last_name) as tenant_name, ' +
		'(cp.first_name || \' \' || cp.last_name) as contact_name, relationship_to_tenant, contact_type ' +
		'from person tp, person cp, contact c, tenant t ' +
		'where tp.personid=t.tenantid and c.tenantid=t.tenantid and cp.personid=c.personid'
	);
	return {contacts: rows};
};

const formatSearchQuery = search => {
	let formatted = search.toLowerCase();
	if (/[0-9]{3}(.?)[0-9]{3}.?[0-9]{4}/.test(search)) {
		formatted = formatPhoneNumberQuery(formatted);
	}
	return formatted;
};

const formatPhoneNumberQuery = search => {
	const match = search.match(/[0-9]{3}(.?)[0-9]{3}.?[0-9]{4}/)[1];
	return search.split(match).join('');
};

const setTenantStatus = rows => {
	for (const tenant of rows) {
		tenant.tenant_status = determineTenantStatus(tenant.lease_status);
	}
};

const determineTenantStatus = leaseStatus => {
	if (leaseStatus === 'Active') return 'Current Tenant';
	if (leaseStatus === 'Complete') return 'Past Tenant';
	if (leaseStatus === 'Pending') return 'Applied';
	return 'Not Yet Applied';
};

const promiseMapAll = async promiseMap => {
	const results = await Promise.all(Object.values(promiseMap).map(currentValue => currentValue()));
	return Object.keys(promiseMap).reduce((accumulator, currentValue, currentIndex) => {
		accumulator[currentValue] = results[currentIndex];
		return accumulator;
	}, {});
};

module.exports = {
	getTenants,
	getTenantByID,
	searchTenants,
	getEmployees,
	getEmployeeByID,
	searchEmployees,
	getPropertyNames,
	createTenant,
	createEmployee,
	getBills,
	getContacts
};