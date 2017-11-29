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
	const nodeList = document.querySelectorAll('.content-heading');
	for (const node of nodeList) {
		node.addEventListener('click', event => {
			expandCollapseTenantInfo(event.currentTarget);
			event.preventDefault();
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
			expandCollapseTenantInfo(target);
		} else if (target.nodeName === 'I' || target.nodeName === 'SPAN') {
			const parent = target.parentNode;
			const parent2 = parent.parentNode;
			if (parent.classList.contains('expand-collapse')) {
				expandCollapseTenantInfo(parent);
			} else if (parent2.classList.contains('expand-collapse')) {
				expandCollapseTenantInfo(parent2);
			} else if (parent.id === 'display-column-list' || target.id === 'display-column-list') {
				const columns = document.querySelectorAll('.is-multiline>div.column');
				for (column of columns) {
					column.style.width = '100%';
				}
			} else if (parent.id === 'display-column-group' || target.id === 'display-column-group') {
				const columns = document.querySelectorAll('.is-multiline>div.column');
				for (column of columns) {
					column.style.width = '50%';
				}
			}
		}
		event.preventDefault();
	});
}

const expandCollapseTenantInfo = target => {
	const content = document.getElementById(target.getAttribute('data-target-id'));
	let indicatorTarget;
	if (target.className === 'content-heading') {
		indicatorTarget = target.nextSibling;
	} else {
		indicatorTarget = target;
	}
	setTimeout(() => {
		indicatorTarget.querySelector('i').classList.toggle('up');
	}, 10);
	if (indicatorTarget.textContent === 'Collapse') {
		content.classList.add('is-hidden');
		indicatorTarget.innerHTML = indicatorTarget.innerHTML.replace('Collapse', 'Expand');
	} else {
		content.classList.remove('is-hidden');
		indicatorTarget.innerHTML = indicatorTarget.innerHTML.replace('Expand', 'Collapse');
	}
};