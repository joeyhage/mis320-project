const express = require('express'),
	app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));

app.set('view engine', 'pug');

app.get('/*', (req, res) => {
	const renderData = {
		path: req.path
	};
	switch (req.path) {
		case '/':
			renderData.title = 'Dashboard';
			break;
		case '/customers':
			renderData.title = 'Customers';
			renderData.customers = [{
				firstName: 'Joey',
				lastName: 'Hage',
				property: '1',
				address: '1234 Main St.'
			}, {
				firstName: 'Zach',
				lastName: 'Hartley',
				property: '2',
				address: '4321 1st St.'
			}];
			break;
		case '/admin':
			renderData.title = 'Administration';
			break;
		default:
			return res.redirect('/');
	}
	const view = 'pages' + (req.path === '/' ? '/dashboard' : req.path);
  	res.render(view, renderData);
});

app.listen(app.get('port'), () => {
  	console.log('Node app is running on port', app.get('port'));
});
