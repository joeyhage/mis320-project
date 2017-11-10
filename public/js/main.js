document.addEventListener('DOMContentLoaded', () => {
	const navbarBurger = document.querySelector('button.navbar-burger');
	if (navbarBurger) {
		navbarBurger.addEventListener('click', () => {
			document.querySelector('button.navbar-burger').classList.toggle('is-active');
			document.querySelector('div.navbar-menu').classList.toggle('is-active');
		});
	}
});

const postFormData = (formElement, url, reqListener) => {
	const xhr = new XMLHttpRequest();
	xhr.onload = () => {
		reqListener(xhr.responseText);
	};
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(stringifyFormAsJSON(new FormData(formElement)));
};

const stringifyFormAsJSON = formData => {
	const json = {};
	for (const pair of formData.entries()) {
		json[pair[0]] = pair[1];
	}
	return JSON.stringify(json);
};