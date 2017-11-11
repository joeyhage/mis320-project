const tenantSearch = document.getElementById('tenant-search');
const tenantsTable = document.getElementById('tenants-table');
const newTenant = document.getElementById('new-tenant');

if (tenantSearch) {
	tenantSearch.addEventListener('submit', event => {
		const searchQuery = event.target.elements.namedItem('searchQuery').value;
		if (!searchQuery || searchQuery.includes('(') || searchQuery.includes(')')) {
			event.preventDefault();
		}
	});
}
if (tenantsTable) {
	tenantsTable.addEventListener('click', ({target}) => {
		if (target.tagName === 'TD') {
			window.location.href = `/tenants/${target.parentNode.id}`;
		}
	});
}
if (newTenant) {
	newTenant.addEventListener('submit', event => {
		event.preventDefault();
		const formElements = event.target.elements;
	});
}