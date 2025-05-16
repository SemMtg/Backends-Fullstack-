describe('Games', function() {

	// Add a game to the inventory of a store (as an example of a test)
	it('adds', function() {

		let game = {title: "Minecraft", developer: "Mojang", ageRating: 3, genres: ["action-adventure", "survival", "exploration", "sandbox"]};
		
		// User tries to add a game
		cy.loggedInRequest('user', {
			method: 'POST',
			url: '/games',
			body: game,
			failOnStatusCode: false
		}).its('status').should('equal',403);

		// Admin tries to add game without data
		cy.loggedInRequest('admin', {
			method: 'POST',
			url: '/games',
			failOnStatusCode: false
		}).its('status').should('equal',400);

		// Admin adds a game
		cy.loggedInRequest('admin', {
			method: 'POST',
			url: '/games',
			body: game,
		});

		// Verify the game is there
		game.id = 1;
		cy.loggedInRequest('user', '/games?developer=Mojang').its('body.0').should('deep.equal', game);
	});

});
