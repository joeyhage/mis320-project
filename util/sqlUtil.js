const queryBuilder = require('./queryBuilder');

const { Client } = require('pg');

const createClient = async () => {
	const client = new Client({
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	});
	await client.connect();
	return client;
};

const getTenants = async client => {
	const tenantsQuery = queryBuilder.tenantsQuery();
	const results = await client.query(tenantsQuery.query);
	setTenantStatus(results);
	return {tenants: results.rows};
};

const getTenantByID = async (client, tenantID) => {
	const results = await client.query(
		'select * from person, tenant where personid=tenantid and tenantid=$1',
		[tenantID]
	);
	return {tenant: results.rows[0]};
};

const searchTenants = async (client, {search, property, tenantStatus}) => {
	const formattedSearchQuery = formatSearchQuery(search);
	const tenantsQuery = queryBuilder.tenantsQuery(formattedSearchQuery, property, tenantStatus);
	const results = await client.query(tenantsQuery.query, tenantsQuery.params);
	setTenantStatus(results);
	if (process.env.DEBUG) {
		console.log('sqlUtil - searchTenants');
		console.dir(results.rows);
	}
	return {tenants: results.rows};
};

const getEmployees = async client => {
	const results = await client.query(
		'select * from person, employee e ' +
		'left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and job_end_date is null ' +
		'order by personid desc'
	);
	return {employees: results.rows};
};

const getEmployeeByID = async (client, employeeID) => {
	const results = await client.query(
		'select * from person, employee e left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and e.employeeid=$1 and job_end_date is null',
		[employeeID]
	);
	return {employee: results.rows[0]};
};

const searchEmployees = async (client, searchQuery) => {
	const formattedSearchQuery = formatSearchQuery(searchQuery);
	const results = await client.query(
		'select * from person, employee e ' +
		'left outer join job j on j.employeeid=e.employeeid ' +
		'where personid=e.employeeid and job_end_date is null and (' +
		'lower(first_name) like $1 or lower(last_name) like $1 or job_title like $1 ' +
		'or lower(first_name || \' \' || last_name) like $1)' +
		'order by personid desc',
		[`%${formattedSearchQuery}%`]
	);
	return {employees: results.rows};
};

const getPropertyNames = async client => {
	const results = await client.query(
		'select property_name from property'
	);
	return {properties: results.rows};
};

const createPerson = async (person, client, isTenant, isEmployee) => {
	return await client.query(
		'insert into person values (default,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *',
		[person.firstName, person.lastName, person.phone1 + person.phone2 + person.phone3,
			person.dob, person.ssn1 + person.ssn2 + person.ssn3, person.email,
			person.streetAddress, person.city, person.state, person.zipcode, isTenant, isEmployee]
	);
};

const createTenant = async tenant => {
	const client = await createClient();
	const personResult = await createPerson(tenant, client, true, false);
	const person = personResult.rows[0];
	const tenantResult = await client.query(
		'insert into tenant values ($1,$2) returning *',
		[person.personid, tenant.annualIncome]
	);
	await client.end();

	return {
		...person,
		...tenantResult.rows[0]
	};
};

const createEmployee = async employee => {
	const client = await createClient();
	const personResult = await createPerson(employee, client, false, true);
	const person = personResult.rows[0];
	const employeeResult = await client.query(
		'insert into employee values ($1,$2) returning *',
		[person.personid, employee.dateOfHire]
	);
	await client.end();

	return {
		...person,
		...employeeResult.rows[0]
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

const setTenantStatus = results => {
	for (const tenant of results.rows) {
		tenant.tenant_status = determineTenantStatus(tenant.lease_status);
	}
};

const determineTenantStatus = leaseStatus => {
	if (leaseStatus === 'Active') return 'Current';
	if (leaseStatus === 'Complete') return 'Past';
	if (leaseStatus === 'Pending') return 'Applied';
	return '';
};

module.exports = {
	createClient,
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