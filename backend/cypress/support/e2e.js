beforeEach(function () {
	// Ask the server to reset the database to what's in schema.sql
	cy.request({method: 'PUT', url: '/reset_database'});
});

// The tokenCache is just for speeding up tests. It works fine without,
// but bcrypt is intentionally pretty slow.
let tokenCache = {};

// This adds a `userRequest` method to the Cypress `cy` object, for easy use
// in your tests.
// `userPassword`: User name and password, separated by a ':'. If no ':' was given,
//                 the password will be the same as the user name.
// `obj`: A Cypress request object or request path string.
Cypress.Commands.add("userRequest", function(userPassword, obj) {
	
	let [user,password] = userPassword.split(':');
	// Assume the password is the same as the user name, if unspecified
	if (password==null) password = user;

	const key = user+':'+password;
	if (tokenCache[key]) return run();

	return cy.request({
		method: 'POST',
		url: '/users/login', 
		body: { userName: user, password: password }, 
	}).its('body').then(function(body) {
		tokenCache[key] = body.token; 
		return run();
	});

	function run() {
		// If `obj` is actual a URL, convert it into a request object.
		if (typeof obj === 'string') obj = {url: obj};
		
		// Make sure `headers` exists on `obj`.
		obj.headers = obj.headers || {};

		// Get the token to set.
        obj.headers.Authorization = `${tokenCache[key]}`;

		
		return cy.request(obj);
	}
});
