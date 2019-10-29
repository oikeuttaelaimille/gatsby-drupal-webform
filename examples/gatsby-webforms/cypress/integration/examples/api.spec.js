/// <reference types="Cypress" />

context('API', () => {
	it('submit a form via API', () => {
		cy.fixture('contact')
			.then(json => cy.request('POST', Cypress.env('ENDPOINT'), { webform_id: 'contact', ...json }))
			.then(response => {
				expect(response.status).to.equal(200)
				expect(response.headers)
					.to.have.property('content-type')
					.and.match(/json/)
			})
	})
})
