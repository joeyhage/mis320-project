const employeeSearch = document.getElementById('employee-search');
const employeesTable = document.getElementById('employees-table');
const newEmployee = document.getElementById('new-employee');
const employeeInfo = document.getElementById('employee-info');

if (employeeSearch) {
	employeeSearch.addEventListener('submit', event => {
		const searchQuery = event.target.elements.namedItem('searchQuery').value;
		if (searchQuery.includes('(') || searchQuery.includes(')')) {
			event.preventDefault();
		}
	});
}
if (employeesTable) {
	employeesTable.addEventListener('click', ({target}) => {
		if (target.tagName === 'TD') {
			window.location.href = `/employees/${target.parentNode.id}`;
		}
	});
}
if (newEmployee) {
	newEmployee.addEventListener('submit', event => {
		const elements = event.target.elements;
		for (const element of elements) {
			if (!element.value && !element.classList.contains('button')) {
				return event.preventDefault();
			}
		}
	});
}

if (employeeInfo) {
	const nodeList = document.querySelectorAll('.content-heading');
	for (const node of nodeList) {
		node.addEventListener('click', event => {
			expandCollapseEmployeeInfo(event.currentTarget);
			event.preventDefault();
		});
	}
	employeeInfo.addEventListener('click', event => {
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
			expandCollapseEmployeeInfo(target);
		} else if (target.nodeName === 'I' || target.nodeName === 'SPAN') {
			const parent = target.parentNode;
			const parent2 = parent.parentNode;
			if (parent.classList.contains('expand-collapse')) {
				expandCollapseEmployeeInfo(parent);
			} else if (parent2.classList.contains('expand-collapse')) {
				expandCollapseEmployeeInfo(parent2);
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

const expandCollapseEmployeeInfo = target => {
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