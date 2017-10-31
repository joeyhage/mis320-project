const tenantsTable = document.querySelector('table.table');
const newTenantForm = document.querySelector('form');
if (tenantsTable) {
	tenantsTable.addEventListener('click', ({target}) => {
		if (target.tagName === 'TD') {
			window.location.pathname = `/tenants/${target.parentNode.id}`
		}
	});
}
if (newTenantForm) {
	document.querySelector('form').addEventListener('submit', event => {
		event.preventDefault();
		const formElements = event.target.elements;
	});
}