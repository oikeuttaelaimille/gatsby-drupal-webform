import React from 'react'

import { render } from '@testing-library/react'

import { WebformElementWrapper, useWebformElement } from '..'

describe('Element wrapper', () => {
	it('element wrapper renders correctly', () => {
		const element = {
			name: 'name',
			type: 'textfield',
			attributes: [
				{
					name: '#title',
					value: 'Your Name'
				},
				{
					name: '#required',
					value: 'true'
				},
				{
					name: '#default_value',
					value: 'John'
				}
			]
		}

		const TestComponent = () => {
			const [, settings] = useWebformElement(element, {})

			return <WebformElementWrapper settings={settings} error={undefined} />
		}

		const { container, queryByText } = render(<TestComponent />)

		// query* functions will return the element or null if it cannot be found
		expect(queryByText('Your Name')).not.toBeNull()

		// Should have css class when error parameter is defined.
		expect(container.firstChild.classList.contains('form-group')).toBe(true)
	})

	it('error messages render correctly', () => {
		const element = {
			name: 'name',
			type: 'textfield',
			attributes: [
				{
					name: '#title',
					value: 'Your Name'
				},
				{
					name: '#required',
					value: 'true'
				},
				{
					name: '#default_value',
					value: 'John'
				}
			]
		}

		const testError = 'This field is required'
		const TestComponent = () => {
			const [, settings] = useWebformElement(element, {})

			return <WebformElementWrapper settings={settings} error={testError} />
		}

		const { container, queryByText } = render(<TestComponent />)

		// query* functions will return the element or null if it cannot be found
		expect(queryByText(testError)).not.toBeNull()

		// Should have css class when error parameter is defined.
		expect(container.firstChild.classList.contains('is-invalid')).toBe(true)
	})

	it('element wrapper class attributes render correctly', () => {
		const element = {
			type: 'number',
			name: 'amount',
			attributes: [
				{
					name: '#title',
					value: 'Test number'
				},
				{
					name: '#class',
					value: 'my-element-class'
				},
				{
					name: '#placeholder',
					value: 'Your favourite number'
				},
				{
					name: '#label_class',
					value: 'my-label-class'
				},
				{
					name: '#wrapper_class',
					value: 'my-wrapper-class'
				}
			]
		}

		const TestComponent = () => {
			const [, settings] = useWebformElement(element, {})

			return <WebformElementWrapper settings={settings} error={undefined} className="custom-class" />
		}

		const { container, queryByText } = render(<TestComponent />)

		// query* functions will return the element or null if it cannot be found
		const labelElement = queryByText('Test number')
		// const inputElement = queryByPlaceholderText('Your favourite number')

		// query* functions will return the element or null if it cannot be found
		expect(labelElement).not.toBeNull()
		expect(labelElement.classList.contains('my-label-class')).toBe(true)

		// Input in not rendered in this test
		// expect(inputElement).not.toBeNull()
		// expect(inputElement.classList.contains('form-control my-element-class')).toBe(true)

		// Should have css class when error parameter is defined.
		expect(container.firstChild.classList.contains('form-group')).toBe(true)
		expect(container.firstChild.classList.contains('custom-class')).toBe(true)
		expect(container.firstChild.classList.contains('my-wrapper-class')).toBe(true)
	})
})
