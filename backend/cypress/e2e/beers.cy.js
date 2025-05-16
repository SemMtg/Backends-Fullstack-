describe('Beer Tests', () => {
    let addedBeerId;

    it('Logs in as admin and performs beer actions', () => {
        // Log in using the custom userRequest command
        cy.userRequest('admin:admin', { url: '/beers/' })
            .then(() => {
                // Retrieve all beers after login
                return cy.userRequest('admin:admin', { url: '/beers/' });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');

                // Add a new beer
                return cy.userRequest('admin:admin', {
                    method: 'POST',
                    url: '/beers/',
                    body: {
                        name: 'Test Beer',
                        percentage: 5.0,
                        brewery: 'Test Brewery',
                        category: 'Lager',
                    },
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                if (response.status === 201) {
                    expect(response.body.message).to.eq('Beer added succesfully');
                    addedBeerId = response.body.beer.id;
                } else {
                    throw new Error('Beer creation failed');
                }

                // Confirm the new beer exists
                return cy.userRequest('admin:admin', { url: '/beers/' });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.some(beer => beer.name === 'Test Beer')).to.be.true;

                // Unauthorized deletion attempt (no token)
                return cy.request({
                    method: 'DELETE',
                    url: `/beers/${addedBeerId}`,
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                expect(response.status).to.eq(403);

                // Delete the beer with a valid token
                return cy.userRequest('admin:admin', {
                    method: 'DELETE',
                    url: `/beers/${addedBeerId}`,
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.include('deleted successfully');

                // Attempt to delete a non-existent beer
                return cy.userRequest('admin:admin', {
                    method: 'DELETE',
                    url: `/beers/99999`,
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                expect(response.status).to.eq(404);

                // Confirm beer is deleted
                return cy.userRequest('admin:admin', { url: '/beers/' });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.some(beer => beer.name === 'Test Beer')).to.be.false;
            });
    });

    it('Tests beer creation with invalid data', () => {
        // Log in and attempt to create a beer with invalid data
        cy.userRequest('admin:admin', { url: '/beers/' })
            .then(() => {
                return cy.userRequest('admin:admin', {
                    method: 'POST',
                    url: '/beers/',
                    body: {
                        name: '',
                        percentage: 5.0,
                        brewery: 'Test Brewery',
                        category: 'Lager',
                    },
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body.error).to.eq('All fields (name, percentage, brewery, category) are required');
            });
    });
});
