/// <reference types="Cypress" />

context('Checkbox serialization', () => {
	beforeEach(() => {
		cy.visit('/checkboxes')
		cy.get('#webform').as('webform')
	})

	it('test serialization', () => {
		cy.server().route('POST', Cypress.env('ENDPOINT')).as('formSubmit')

		cy.get('button').click()

		// Wait for response.status to be 200
		cy.wait('@formSubmit', { timeout: 10000 }).its('status').should('be', 200)

		cy.get('@formSubmit')
			.its('requestBody') // alternative: its('request.body')
			.should('deep.equal', {
				webform_id: 'checkboxes',
				default_checked: '1'
				// default_checked should not be present.

				/** @todo: checkboxes element serialization */
			})
	})
})
