const dashboardPath = new RegExp(/^(\/)?$/);

const tenantsPath = new RegExp(/^\/tenants(\/)?$/);
const tenantSearchPath = new RegExp(/^\/tenants\/search/);
const tenantInfoPath = new RegExp(/^\/tenants\/([0-9]+)(\/)?$/);
const tenantsSubpagePath = new RegExp(/^\/tenants\/([a-z-]+)(\/)?$/);

const employeesPath = new RegExp(/^\/employees(\/)?$/);
const employeeSearchPath = new RegExp(/^\/employees\/search/);
const employeeInfoPath = new RegExp(/^\/employees\/([0-9]+)(\/)?$/);
const employeesSubpagePath = new RegExp(/^\/employees\/([a-z-]+)(\/)?$/);

const maintenancePath = new RegExp(/^\/maintenance(\/)?$/);
const maintenanceSubpagePath = new RegExp(/^\/maintenance\/([a-z-]+)(\/)?$/);

const billingPath = new RegExp(/^\/billing(\/)?$/);
const billInfoPath = new RegExp(/^\/billing\/([0-9]+)(\/)?$/);

const simplePaths = [dashboardPath,
	tenantsPath, tenantSearchPath, tenantsSubpagePath,
	employeesPath, employeeSearchPath, employeesSubpagePath,
	maintenancePath, maintenanceSubpagePath,
	billingPath, billInfoPath];

module.exports = {
	dashboardPath,
	tenantsPath,
	tenantSearchPath,
	tenantInfoPath,
	tenantsSubpagePath,
	employeesPath,
	employeeSearchPath,
	employeeInfoPath,
	employeesSubpagePath,
	maintenancePath,
	maintenanceSubpagePath,
	billingPath,
	billInfoPath,
	simplePaths
};