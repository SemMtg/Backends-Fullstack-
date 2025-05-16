describe('Likes Tests', () => {
    const baseUrl = 'http://127.0.0.1:31993';
    const userName = 'user';

    beforeEach(function () {
        // Reset the database before each test
        cy.request({ method: 'PUT', url: '/reset_database' });
    });

    it('should retrieve all beers', () => {
        cy.userRequest('user:user', { url: `${baseUrl}/beers` }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
        });
    });

    it('should allow liking a beer', () => {
        cy.userRequest('user:user', { 
            method: 'POST',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName }
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Like added successfully');
        });

        cy.userRequest('user:user', { url: `${baseUrl}/likes/${userName}` }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.some(beer => beer.id === 3)).to.be.true;
        });
    });

    it('should allow unliking a beer', () => {
        // Like the beer first
        cy.userRequest('user:user', {
            method: 'POST',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName }
        });

        cy.userRequest('user:user', {
            method: 'DELETE',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', 'Like removed successfully');
        });

        cy.userRequest('user:user', { url: `${baseUrl}/likes/${userName}` }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.some(beer => beer.id === 3)).to.be.false;
        });
    });

    it('should deny access to liking a beer without authentication', () => {
        cy.request({
            method: 'POST',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.error).to.eq('No token provided');
        });
    });

    it('should return an error when unliking a non-existing beer', () => {
        cy.userRequest('user:user', {
            method: 'DELETE',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 9999, userName },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body.error).to.eq('You have not liked this beer');
        });
    });

    it('should return an error when attempting to like the same beer twice', () => {
        // Like the beer once
        cy.userRequest('user:user', {
            method: 'POST',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName }
        });

        // Try to like it again
        cy.userRequest('user:user', {
            method: 'POST',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.eq('You have already liked this beer');
        });
    });

    it('should return an error when attempting to unlike a beer that was not liked', () => {
        cy.userRequest('user:user', {
            method: 'DELETE',
            url: `${baseUrl}/likes/like`,
            body: { beerId: 3, userName },
            failOnStatusCode: false, 
        }).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body.error).to.eq('You have not liked this beer');
        });
    });
});
