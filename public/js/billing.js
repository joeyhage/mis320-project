const billingInfo = document.getElementById('billing-info');
const tenantsTable = document.getElementById('tenants-table');

if (billingInfo) {
	billingInfo.addEventListener('click', event => {
		const {target} = event;
		if (target.classList.contains('expand-collapse')) {
			expandCollapseInfo(target);
		} else if (target.nodeName === 'I' || target.nodeName === 'SPAN') {
			const parent = target.parentNode;
			const parent2 = parent.parentNode;
			if (parent.classList.contains('expand-collapse')) {
				expandCollapseInfo(parent);
			} else if (parent2.classList.contains('expand-collapse')) {
				expandCollapseInfo(parent2);
			}
		}
		if (target.nodeName !== 'BUTTON' && target.getAttribute('type') !== 'submit') {
			event.preventDefault();
		}
	});
}
if (tenantsTable) {
	tenantsTable.addEventListener('click', ({target}) => {
		if (target.tagName === 'TD') {
			window.location.href = `/billing/${target.parentNode.id}`;
		}
	});
}
