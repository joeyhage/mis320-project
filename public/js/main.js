document.addEventListener('DOMContentLoaded', () => {
	const navbarBurger = document.querySelector('button.navbar-burger');
	if (navbarBurger) {
		navbarBurger.addEventListener('click', () => {
			document.querySelector('button.navbar-burger').classList.toggle('is-active');
			document.querySelector('div.navbar-menu').classList.toggle('is-active');
		});
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