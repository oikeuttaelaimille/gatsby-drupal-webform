import React from 'react'
import renderer from 'react-test-renderer'

import Webform from '../index'

import InputGroup from '../InputGroup'

// Mock Math.random
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

describe('InputGroup', () => {
	it('renders correctly', () => {
		const tree = renderer.create(<InputGroup label="Test Input Group" className="custom-class" type="email">Add-on</InputGroup>).toJSON()

		expect(tree).toMatchSnapshot()
	})
})

describe('Webform', () => {
	it('renders correctly', () => {
		const elements = [
			{
				name: "name",
				_type: 'textfield',
				_title: 'Your Name',
				_description: 'What is your name&#63;',
				_required: true
			},
			{
				name: "email",
				_type: 'email',
				_title: 'Your Email',
				_required: true
			},
			{
				name: "subject",
				_type: 'textfield',
				_title: 'Subject',
				_required: true
			},
			{
				name: "message",
				_type: 'textarea',
				_title: 'Message',
				_required: true
			},
			{
				name: "consent",
				_type: 'checkbox',
				_title: 'Add me to email list',
				_required: true
			},
			{
				name: "color",
				_type: 'radios',
				_title: 'What is favourite color',
				_options: {
					'blue': 'Blue',
					'red': 'Red',
					'pink': 'Pink'
				}
			},
			{
				name: "markup",
				_type: 'webform_markup',
				_markup: '<p>Custom markup</p>'
			},
			{
				name: "text",
				_type: 'processed_text',
				_markup: '<p>Processed text</p>'
			},
			{
				name: "unknown",
				_type: 'unknown',
				_title: 'Unknown element',
			},
		]

		const tree = renderer.create(<Webform className="custom-class" name="test-webform" endpoint="/form-submit" elements={elements} />).toJSON()

		expect(tree).toMatchSnapshot()
	})
})