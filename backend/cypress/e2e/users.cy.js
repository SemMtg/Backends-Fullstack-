describe('Users Tests', () => {
    it('Logs in as admin and performs user actions', () => {
        // Log in using the custom userRequest command
        cy.userRequest('admin:admin', { url: '/users/' })
            .then(() => {
                // Retrieve all users after login
                return cy.userRequest('admin:admin', { url: '/users/' });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.be.an('array');

                // Add a new user
                return cy.userRequest('admin:admin', {
                    method: 'POST',
                    url: '/users/',
                    body: { name: 'testuser', password: 'password123' },
                    failOnStatusCode: false,
                });
            })
            .then((response) => {
                if (response.status === 201) {
                    expect(response.body.message).to.eq('User created successfully');
                } else {
                    expect(response.status).to.eq(400);
                    expect(response.body.error).to.eq('User already exists');
                }

                // Retrieve all users again to confirm the new user was added
                return cy.userRequest('admin:admin', { url: '/users/' });
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.some(user => user.name === 'testuser')).to.be.true;
            });
    });

    it('Tests unauthorized access and user creation with invalid data', () => {
        // Attempt to create a user with missing name
        cy.userRequest('admin:admin', {
            method: 'POST',
            url: '/users/',
            body: { password: 'password123' },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.eq('Name and password are required');
        });

        // Attempt to create a user with missing password
        cy.userRequest('admin:admin', {
            method: 'POST',
            url: '/users/',
            body: { name: 'testuser2' },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.eq('Name and password are required');
        });
    });
});
