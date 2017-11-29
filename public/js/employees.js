const employeeSearch = document.getElementById('employee-search');
const employeesTable = document.getElementById('employees-table');
const newEmployee = document.getElementById('new-employee');
const dateOfHire = document.querySelector('input[name="dateOfHire"]');

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
if (dateOfHire) {
	const currentDate = new Date();
	dateOfHire.value = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
}