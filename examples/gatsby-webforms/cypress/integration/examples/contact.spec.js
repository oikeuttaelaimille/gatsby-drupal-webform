/// <reference types="Cypress" />

context('Contact form', () => {
	beforeEach(() => {
		cy.visit('/contact')
		cy.server()
			.route('POST', Cypress.env('ENDPOINT'))
			.as('formSubmit')
	})

	it('submit a form', () => {
		cy.fixture('contact').then(json => {
			Object.entries(json).forEach(([name, value]) => {
				cy.get('#webform')
					.find(`[name="${name}"]`)
					.clear()
					.type(value)
			})

			cy.get('#webform').submit()

			// Wait for response.status to be 200
			cy.wait('@formSubmit')
				.its('status')
				.should('be', 200)

			cy.get('#webform')
				.next()
				.should('contain', 'Form submitted!')
		})
	})
})
