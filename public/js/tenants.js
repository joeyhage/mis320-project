const tenantSearch = document.getElementById('tenant-search');
const tenantsTable = document.getElementById('tenants-table');
const newTenant = document.getElementById('new-tenant');
const tenantInfo = document.getElementById('tenant-info');

if (tenantSearch) {
	tenantSearch.addEventListener('submit', event => {
		const elements = event.target.elements;
		const search = elements.namedItem('search').value;
		if (search.includes('(') || search.includes(')')) {
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
if (tenantInfo) {
	const contentHeadingList = document.querySelectorAll('.content-heading');
	for (const node of contentHeadingList) {
		node.addEventListener('click', event => {
			expandCollapseInfo(event.currentTarget);
			event.preventDefault();
		});
	}
	const billingRowList = document.querySelectorAll('#billing-content tbody>tr');
	for (const node of billingRowList) {
		node.addEventListener('click', ({target}) => {
			if (target.tagName === 'TD') {
				window.location.href = `/billing/${tenantInfo.getAttribute('data-tenant-id')}`;
			}
		});
	}
	tenantInfo.addEventListener('click', event => {
		const {target} = event;
		if (target.id === 'show-ssn') {
			const showSsn = document.getElementById('show-ssn');
			const maskedSsn = document.getElementById('masked-ssn');
			const fullSsn = document.getElementById('full-ssn');

			if (maskedSsn.style.display === 'none') {
				maskedSsn.style.display = 'inline';
				fullSsn.style.display = 'none';
				showSsn.innerText = 'Show';
				showSsn.classList.remove('is-success');
				showSsn.classList.add('is-danger');
			} else {
				maskedSsn.style.display = 'none';
				fullSsn.style.display = 'inline';
				showSsn.innerText = 'Hide';
				showSsn.classList.remove('is-danger');
				showSsn.classList.add('is-success');
			}
		} else if (target.classList.contains('expand-collapse')) {
			expandCollapseInfo(target);
		} else if (target.nodeName === 'I' || target.nodeName === 'SPAN') {
			const parent = target.parentNode;
			const parent2 = parent.parentNode;
			if (parent.classList.contains('expand-collapse')) {
				expandCollapseInfo(parent);
			} else if (parent2.classList.contains('expand-collapse')) {
				expandCollapseInfo(parent2);
			} else if (parent.id === 'display-column-list' || target.id === 'display-column-list') {
				const columns = document.querySelectorAll('.is-multiline>div.column');
				for (column of columns) {
					column.classList.remove('is-6');
					column.classList.add('is-12');
				}
			} else if (parent.id === 'display-column-group' || target.id === 'display-column-group') {
				const columns = document.querySelectorAll('.is-multiline>div.column');
				for (column of columns) {
					column.classList.remove('is-12');
					column.classList.add('is-6');
				}
			}
		}
		event.preventDefault();
	});
}