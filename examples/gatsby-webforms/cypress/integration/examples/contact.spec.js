/// <reference types="Cypress" />

context('Contact form', () => {
	beforeEach(() => {
		cy.visit('/contact')
	})

	it('submit a form', () => {
		cy.fixture('contact').then(json => {
			Object.entries(json).forEach(([name, value]) => {
				cy.get('#webform')
					.find(`[name="${name}"]`)
					.clear()
					.type(value)
			})

			cy.intercept(Cypress.env('ENDPOINT')).as('formSubmit')

			cy.get('#webform').submit()

			// Wait for response.status to be 200
			cy.wait('@formSubmit')
				.its('response.statusCode')
				.should('equal', 200)

			cy.get('#webform')
				.next()
				.should('contain', 'Form submitted!')
		})
	})
})
