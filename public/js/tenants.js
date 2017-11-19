const tenantSearch = document.getElementById('tenant-search');
const tenantsTable = document.getElementById('tenants-table');
const newTenant = document.getElementById('new-tenant');

if (tenantSearch) {
	tenantSearch.addEventListener('submit', event => {
		const elements = event.target.elements;
		const search = elements.namedItem('search').value;
		const property = elements.namedItem('property').value;
		const tenantStatus = elements.namedItem('tenantStatus').value;
		if ((!search && !property && !tenantStatus) || search.includes('(') || search.includes(')')) {
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
		const elements = event.target.elements;
		for (const element of elements) {
			if (!element.value && !element.classList.contains('button')) {
				return event.preventDefault();
			}
		}
	});
}