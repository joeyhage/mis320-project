const employeeSearch = document.getElementById('employee-search');
const employeesTable = document.getElementById('employees-table');
const newEmployee = document.getElementById('new-employee');

if (employeeSearch) {
	employeeSearch.addEventListener('submit', event => {
		const searchQuery = event.target.elements.namedItem('searchQuery').value;
		if (!searchQuery || searchQuery.includes('(') || searchQuery.includes(')')) {
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
		event.preventDefault();
		const formElements = event.target.elements;
	});
}