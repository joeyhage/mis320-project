const tenantSearch = document.getElementById('tenant-search');
const tenantsTable = document.getElementById('tenants-table');
const newTenant = document.getElementById('new-tenant');

if (tenantSearch) {
	tenantSearch.addEventListener('submit', event => {
		const elements = event.target.elements;
		const search = elements.namedItem('search').value;
		const property = elements.namedItem('property').value;
		const leaseStatus = elements.namedItem('leaseStatus').value;
		if ((!search && !property && !leaseStatus) || search.includes('(') || search.includes(')')) {
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