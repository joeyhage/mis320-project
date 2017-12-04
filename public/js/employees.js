const employeeSearch = document.getElementById('employee-search');
const employeesTable = document.getElementById('employees-table');
const newEmployee = document.getElementById('new-employee');
const employeeInfo = document.getElementById('employee-info');

if (employeeSearch) {
	employeeSearch.addEventListener('submit', event => {
		const search = event.target.elements.namedItem('search').value;
		if (search.includes('(') || search.includes(')')) {
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
			expandCollapseInfo(event.currentTarget);
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