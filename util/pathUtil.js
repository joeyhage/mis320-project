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

const administrationPath = new RegExp(/^\/administration(\/)?$/);
const administrationSubpagePath = new RegExp(/^\/administration\/([a-z-]+)(\/)?$/);

const simplePaths = [dashboardPath,
	tenantsPath, tenantSearchPath, tenantInfoPath, tenantsSubpagePath,
	employeesPath, employeeSearchPath, employeeInfoPath, employeesSubpagePath,
	maintenancePath, maintenanceSubpagePath,
	administrationPath, administrationSubpagePath];

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
	administrationPath,
	administrationSubpagePath,
	simplePaths
};