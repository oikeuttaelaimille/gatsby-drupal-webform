import React from 'react'
import { Html5Entities } from 'html-entities'
import { classNames } from './utils'

import Input from './Input'
import Checkbox from './Checkbox'

interface BaseWebformElement {
	name: string
	_type: string
}

interface BaseWebformInput extends BaseWebformElement {
	_title: string
	_description?: string
	_disabled?: true
	_readonly?: true
	_required?: true
	_default_value?: string
}

interface WebformTextArea extends BaseWebformInput {
	_type: 'textarea'
}

interface WebformTextField extends BaseWebformInput {
	_type: 'textfield'
}

interface WebformEmail extends BaseWebformInput {
	_type: 'email'
}

interface WebformTel extends BaseWebformInput {
	_type: 'tel'
}

interface BaseWebformOptions {
	_options_display?: string
	_options: {
		[key: string]: string
	}
}

interface WebformCheckboxes extends BaseWebformInput, BaseWebformOptions {
	_type: 'checkboxes'
}

interface WebformCheckbox extends BaseWebformInput {
	_type: 'checkbox'
}

interface WebformRadios extends BaseWebformInput, BaseWebformOptions {
	_type: 'radios'
}

interface WebformRadio extends BaseWebformInput {
	_type: 'radio'
}

interface WebformActions extends BaseWebformElement {
	_type: 'webform_actions'
	_submit__label: string
}

interface WebformProcessedText extends BaseWebformElement {
	_type: 'processed_text'
	_text: string
}

interface WebformMarkup extends BaseWebformElement {
	_type: 'webform_markup'
	_markup: string
}

type WebformInput = WebformTextField | WebformEmail | WebformTel

type WebformOptions = WebformCheckbox | WebformCheckboxes | WebformRadio | WebformRadios

export type WebformElement = WebformInput | WebformOptions | WebformActions | WebformTextArea | WebformProcessedText | WebformMarkup

/**
 * Translate webform input type to html type property value.
 *
 * @param type
 */
const getType = (element: WebformInput | WebformOptions) => {
	switch (element._type) {
		case 'checkbox':
		case 'checkboxes':
			return 'checkbox'
		case 'radio':
		case 'radios':
			return 'radio'
		case 'textfield':
			return 'text'
		case 'tel':
		case 'email':
		default:
			return element._type
	}
}

const decodeHtmlEntities = (str?: string) => {
	const htmlEntities = new Html5Entities()
	if (str) {
		return htmlEntities.decode(str)
	}

	return undefined
}

/**
 * Translate webform data to input element.
 *
 * @param props
 */
export const WebformInputElement: React.FC<{ element: WebformInput; error?: string }> = ({ element, error }) => (
	<Input
		name={element.name}
		type={getType(element)}
		label={element._title}
		disabled={element._disabled}
		readOnly={element._readonly}
		required={element._required}
		defaultValue={element._default_value}
		help={decodeHtmlEntities(element._description)}
		className={error && 'is-invalid'}
		error={error}
	/>
)

/**
 * Translate webform data to checkbox element.
 *
 * @param props
 */
export const WebformOptionsElement: React.FC<{ element: WebformOptions; error?: string }> = ({ element, error }) => {
	const type = getType(element) as 'checkbox' | 'radio'

	switch (element._type) {
		case 'radios':
		case 'checkboxes':
			return (
				<div className={classNames('option-group', element._options_display)}>
					{Object.entries(element._options).map(([value, label]) => (
						<Checkbox
							key={value}
							name={element.name}
							type={type}
							label={label}
							value={value}
							disabled={element._disabled}
							readOnly={element._readonly}
							required={element._required}
							defaultChecked={value === element._default_value}
						/>
					))}
				</div>
			)
		case 'radio':
		case 'checkbox':
		default:
			return (
				<Checkbox
					name={element.name}
					type={type}
					label={element._title}
					disabled={element._disabled}
					readOnly={element._readonly}
					required={element._required}
					defaultChecked={!!element._default_value}
				/>
			)
	}
}
