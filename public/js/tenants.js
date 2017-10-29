document.querySelector('table.table').addEventListener('click', ({target}) => {
	if (target.tagName === 'TD') {
		window.location.pathname = `/tenants/${target.parentNode.id}`
	}
});