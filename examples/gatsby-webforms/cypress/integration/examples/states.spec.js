/// <reference types="Cypress" />

context('Custom components', () => {
	beforeEach(() => {
		cy.visit('/states')
		cy.server()
			.route('POST', Cypress.env('ENDPOINT'))
			.as('formSubmit')

		cy.get('#webform').as('webform')
	})

	it('simple states', () => {
		cy.get('input[name="simple_checkbox"]')
			.as('simple_checkbox')
			.check()
		cy.get('input[name="simple_textfield"]')
			.as('simple_textfield')
			.should('exist')

		// Unchecking the checkbox should hide @simple_textfield.
		cy.get('@simple_checkbox').uncheck()
		cy.get('@simple_textfield').should('not.exist')
	})

	it('states with element group', () => {
		cy.get('#form-radios-ice-cream').as('ice-cream')
		cy.get('#form-radios-cupcake').as('cupcake')
		cy.get('input[name="option_1"]').should('not.exist')
		cy.get('input[name="option_2"]').should('not.exist')

		cy.get('@ice-cream').check()
		cy.get('input[name="option_1"]').should('exist')
		cy.get('input[name="option_2"]').should('not.exist')

		cy.get('@cupcake').check()
		cy.get('input[name="option_1"]').should('not.exist')
		cy.get('input[name="option_2"]').should('exist')
	})
})
