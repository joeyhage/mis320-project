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
		console.trace(new Error(err));
	} finally {
		client.release();
	}
};

const poolQuery = async (queryString, params) => {
	try {
		return await query(pool, queryString, params);
	} catch (err) {
		console.trace(new Error(err));
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
		console.dir(rows);
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
	const rows = await poolQuery(
		'select * from person, employee e left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and e.employeeid=$1 and job_end_date is null',
		[employeeID]
	);
	return {employee: rows[0]};
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
	return '';
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
	createEmployee
};