document.addEventListener('DOMContentLoaded', () => {
	const navbarBurger = document.querySelector('button.navbar-burger');
	if (navbarBurger) {
		navbarBurger.addEventListener('click', () => {
			document.querySelector('button.navbar-burger').classList.toggle('is-active');
			document.querySelector('div.navbar-menu').classList.toggle('is-active');
		});
	}
});