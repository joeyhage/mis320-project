document.addEventListener('DOMContentLoaded', () => {
	const navbarBurger = document.querySelector('button.navbar-burger');
	if (navbarBurger) {
		navbarBurger.addEventListener('click', () => {
			document.querySelector('button.navbar-burger').classList.toggle('is-active');
			document.querySelector('div.navbar-menu').classList.toggle('is-active');
		});
	}
	const dateElements = document.querySelectorAll('.date');
	if (dateElements && dateElements.length) {
		for (const dateElement of dateElements) {
			const dateString = dateElement.innerHTML;
			if (dateString) {
				dateElement.innerHTML = new Date(dateString).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
			}
		}
	}
	const monetaryElements = document.querySelectorAll('.monetary');
	if (monetaryElements && monetaryElements.length) {
		const numberFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
		for (const monetaryElement of monetaryElements) {
			const monetaryAmount = monetaryElement.innerHTML;
			if (monetaryAmount) {
				monetaryElement.innerHTML = numberFormat.format(monetaryAmount);
			}
		}
	}
});

const form = document.querySelector('form');
if (form) {
	const nodeList = form.querySelectorAll('input[type="date"]');
	for (const node of nodeList) {
		node.addEventListener('change', ({target}) => {
			const value = target.value;
			const split = value.split('-');
			if (split[0].length > 4) {
				split[0] = split[0].substring(0,4);
				target.value = split.join('-');
			}
		});
	}
}

const expandCollapseInfo = target => {
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
	if (indicatorTarget.textContent === 'Show Less') {
		content.classList.add('is-hidden');
		indicatorTarget.innerHTML = indicatorTarget.innerHTML.replace('Less', 'More');
	} else {
		content.classList.remove('is-hidden');
		indicatorTarget.innerHTML = indicatorTarget.innerHTML.replace('More', 'Less');
	}
};