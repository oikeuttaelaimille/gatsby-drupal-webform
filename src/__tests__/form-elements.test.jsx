import React from 'react'
import renderer from 'react-test-renderer'

import Webform from '../Webform'

const webform = {
	drupal_internal__id: 'contact',
	elements: [
		{
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
		},
		{
			name: 'email',
			type: 'email',
			attributes: [
				{
					name: '#title',
					value: 'Your Email'
				},
				{
					name: '#required',
					value: 'true'
				},
				{
					name: '#default_value',
					value: 'john@example.com'
				}
			]
		},
		{
			name: 'subject',
			type: 'email',
			attributes: [
				{
					name: '#title',
					value: 'Subject'
				},
				{
					name: '#required',
					value: 'true'
				}
			]
		},
		{
			name: 'message',
			type: 'textarea',
			attributes: [
				{
					name: '#title',
					value: 'Subject'
				},
				{
					name: '#required',
					value: 'true'
				}
			]
		},
		{
			name: 'actions',
			type: 'webform_actions',
			attributes: [
				{
					name: '#title',
					value: 'Submit button(s)'
				},
				{
					name: '#submit__label',
					value: 'Send message'
				}
			]
		}
	]
}

describe('Webform', () => {
	it('contact form renders correctly', () => {
		const tree = renderer
			.create(<Webform className="my-form" style={{ color: 'black' }} endpoint="/form-submit" webform={webform} />)
			.toJSON()

		expect(tree).toMatchSnapshot()
	})

	it('title attributes', () => {
		const webform = {
			drupal_internal__id: 'contact',
			elements: [
				{
					name: 'name',
					type: 'textfield',
					attributes: [
						{
							name: '#title',
							value: 'Your Name'
						},
						{
							name: '#title_display',
							value: 'invisible'
						}
					]
				}
			]
		}

		const tree = renderer
			.create(<Webform className="my-form" style={{ color: 'black' }} endpoint="/form-submit" webform={webform} />)
			.toJSON()

		expect(tree).toMatchSnapshot()
	})

	it('hidden inputs', () => {
		const webform = {
			drupal_internal__id: 'contact',
			elements: [
				{
					name: 'name',
					type: 'hidden',
					attributes: [
						{
							name: '#title',
							value: 'Your Name'
						}
					]
				}
			]
		}

		const tree = renderer
			.create(<Webform className="my-form" style={{ color: 'black' }} endpoint="/form-submit" webform={webform} />)
			.toJSON()

		expect(tree).toMatchSnapshot()
	})
})
