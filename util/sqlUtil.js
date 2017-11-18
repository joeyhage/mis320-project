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
	return {tenants: results.rows};
};

const getTenantByID = async (client, tenantID) => {
	const results = await client.query(
		'select * from person, tenant where personid=tenantid and tenantid=$1',
		[tenantID]
	);
	return {tenant: results.rows[0]};
};

const searchTenants = async (client, {search, property, leaseStatus}) => {
	const formattedSearchQuery = formatSearchQuery(search);
	const tenantsQuery = queryBuilder.tenantsQuery(formattedSearchQuery, property, leaseStatus);
	const results = await client.query(tenantsQuery.query, tenantsQuery.params);
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
		[formattedSearchQuery]
	);
	return {employees: results.rows};
};

const getPropertyNames = async client => {
	const results = await client.query(
		'select property_name from property'
	);
	return {properties: results.rows};
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

module.exports = {
	createClient,
	getTenants,
	getTenantByID,
	searchTenants,
	getEmployees,
	getEmployeeByID,
	searchEmployees,
	getPropertyNames
};