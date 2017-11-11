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
	const results = await client.query(
		'select * from person, tenant where personid=tenantid and istenant=true order by personid desc limit 10'
	);
	return {tenants: results.rows};
};

const getTenantByID = async (client, tenantID) => {
	const results = await client.query(
		'select * from person, tenant where personid=tenantid and tenantid=$1',
		[tenantID]
	);
	return {tenant: results.rows[0]};
};

const searchTenants = async (client, searchQuery) => {
	const formattedSearchQuery = formatSearchQuery(searchQuery);
	const results = await client.query(
		'select * from person, tenant where personid=tenantid and istenant=true and (' +
		'lower(first_name) like $1 or lower(last_name) like $1 or phone_number like $1 or lower(email) like $1 ' +
		'or lower(first_name || \' \' || last_name) like $1) limit 20',
		[formattedSearchQuery]
	);
	return {tenants: results.rows};
};

const getEmployees = async client => {
	const results = await client.query(
		'select * from person, employee where personid=employeeid and isemployee=true order by personid desc limit 10'
	);
	return {employees: results.rows};
};

const getEmployeeByID = async (client, employeeID) => {
	const results = await client.query(
		'select * from person, employee where personid=employeeid and employeeid=$1',
		[employeeID]
	);
	return {employee: results.rows[0]};
};

const searchEmployees = async (client, searchQuery) => {
	const formattedSearchQuery = formatSearchQuery(searchQuery);
	const results = await client.query(
		'select * from person, employee where personid=employeeid and isemployee=true and (' +
		'lower(first_name) like $1 or lower(last_name) like $1 or job_title like $1 ' +
		'or lower(first_name || \' \' || last_name) like $1) limit 20',
		[formattedSearchQuery]
	);
	return {employees: results.rows};
};

const formatSearchQuery = searchQuery => {
	let formatted = searchQuery.toLowerCase();
	if (/[0-9]{3}(.?)[0-9]{3}.?[0-9]{4}/.test(searchQuery)) {
		formatted = formatPhoneNumberQuery(formatted);
	}
	return `%${formatted}%`;
};

const formatPhoneNumberQuery = searchQuery => {
	const match = searchQuery.match(/[0-9]{3}(.?)[0-9]{3}.?[0-9]{4}/)[1];
	return searchQuery.split(match).join('');
};

module.exports = {
	createClient,
	getTenants,
	getTenantByID,
	searchTenants,
	getEmployees,
	getEmployeeByID,
	searchEmployees
};