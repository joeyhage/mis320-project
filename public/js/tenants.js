const tenantSearch = document.getElementById('tenant-search');
const tenantsTable = document.getElementById('tenants-table');
const newTenant = document.getElementById('new-tenant');
const tenantInfo = document.getElementById('tenant-info');

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
if (tenantInfo) {
	document.querySelector('body').addEventListener('click', event => {
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
			expandCollapseTenantInfo(target);
		} else if (target.nodeName === 'I' || target.nodeName === 'SPAN') {
			const parent = target.parentNode;
			const parent2 = parent.parentNode;
			if (parent.classList.contains('expand-collapse')) {
				expandCollapseTenantInfo(parent);
			} else if (parent2.classList.contains('expand-collapse')) {
				expandCollapseTenantInfo(parent2);
			}
		}
		event.preventDefault();
	});
}

const expandCollapseTenantInfo = target => {
	const content = document.getElementById(target.getAttribute('data-target-id'));
	setTimeout(() => {
		target.querySelector('i').classList.toggle('up');
	});
	if (target.textContent === 'Collapse') {
		content.classList.add('is-hidden');
		target.innerHTML = target.innerHTML.replace('Collapse', 'Expand');
	} else {
		content.classList.remove('is-hidden');
		target.innerHTML = target.innerHTML.replace('Expand', 'Collapse');
	}
};