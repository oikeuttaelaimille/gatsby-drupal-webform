import React, { useState, FormEvent } from 'react'
import axios from 'axios'

import { getAttributeValue, formToJSON } from './utils'
import {
	WebformDebug,
	WebformInput,
	WebformSelect,
	WebformTextarea,
	WebformCheckbox,
	WebformCheckboxGroup,
	WebformText
} from './components'

export const DEFAULT_SUBMIT_LABEL = 'Submit'

/**
 * Webform object as returned from GraphQL query.
 */
export interface WebformObject {
	drupal_internal__id: string
	description: string
	status: string
	elements: WebformElement[]
}

export type WebformSettings = {
	attributes: { [key: string]: string }
	states: { [key: string]: boolean }
}

/**
 * Webform element (e.g. text field input or submit button).
 */
export type WebformElement = {
	name: string
	type: string
	attributes: Array<{
		name: string
		value: string
	}>
	options?: Array<{
		label: string
		value: string
	}>
	states?: Array<{
		state: string
		selector: string
		condition: {
			[key: string]: boolean | string | null
		}
	}>
}

export type WebformCustomComponentProps = {
	element: WebformElement
	error?: string
}

/**
 * Custom component for webform element
 */
export type WebformCustomComponent = React.FC<WebformCustomComponentProps>

export type WebformValidateHandler = (event: FormEvent<HTMLFormElement>) => boolean
export type WebformSubmitHandler = (data: ReturnType<typeof formToJSON>) => void | boolean | Promise<void | boolean>
export type WebformSuccessHandler = (response: any, requestData: any) => void
export type WebformErrorHandler = (err: any, requestData: any) => void

export class WebformError extends Error {
	response: any

	constructor(response: any) {
		super()

		this.response = response
	}
}

/**
 * Errors returned by Drupal.
 */
type WebformErrors = {
	[name: string]: string
}

interface Props {
	id?: string
	className?: string
	style?: React.CSSProperties
	noValidate?: boolean

	webform: WebformObject

	onValidate?: WebformValidateHandler
	onSuccess?: WebformSuccessHandler
	onError?: WebformErrorHandler

	/**
	 * Called right before webform data is POSTed to the api.
	 *
	 * If callback returns false nothing is sent to the api.
	 */
	onSubmit?: WebformSubmitHandler

	/** Form POST endpoint. */
	endpoint: string

	/** Extra data to POST. */
	extraData?: object

	/** Provide custom components that handle specific webform elements. */
	customComponents: { [name: string]: WebformCustomComponent }
}

/**
 * Render single webform element.
 */
export function renderWebformElement(element: WebformElement, error?: string, CustomComponent?: WebformCustomComponent) {
	const customComponentAPI = {
		error
	}

	// Render using custom compoennt if provided:
	if (CustomComponent) {
		return <CustomComponent element={element} {...customComponentAPI} />
	}

	// Othervise select renderer based on element type:
	switch (element.type) {
		case 'textfield':
			return <WebformInput element={{ ...element, type: 'text' }} {...customComponentAPI} />
		case 'textarea':
			return <WebformTextarea element={element} {...customComponentAPI} />
		case 'tel':
		case 'number':
		case 'email':
		case 'hidden':
			return <WebformInput element={element} {...customComponentAPI} />
		case 'checkbox':
		case 'radio':
			/** Render single checkbox or radio element. */
			return <WebformCheckbox element={element} {...customComponentAPI} />
		case 'checkboxes':
			return <WebformCheckboxGroup element={{ ...element, type: 'checkbox' }} {...customComponentAPI} />
		case 'radios':
			return <WebformCheckboxGroup element={{ ...element, type: 'radio' }} {...customComponentAPI} />
		case 'select':
			return <WebformSelect element={element} {...customComponentAPI} />
		case 'webform_markup':
		case 'processed_text':
			return <WebformText element={element} {...customComponentAPI} />
		// Submit button
		case 'webform_actions':
			return (
				<div className="form-group">
					<button type="submit">{getAttributeValue('#submit__label', element) || DEFAULT_SUBMIT_LABEL}</button>
				</div>
			)
		// Unknown element type -> render as json string
		default:
			return <WebformDebug element={element} error={error} />
	}
}

/**
 * Drupal webform react component.
 */
const Webform = ({ webform, customComponents, ...props }: Props) => {
	const [errors, setErrors] = useState<WebformErrors>({})

	const submitHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault()

		const target = event.currentTarget

		// Clear errors from previous submit.
		setErrors({})

		// Remove lingering css classes from previous submits.
		target.classList.remove('form-submitting', 'form-error', 'form-submitted')

		if ((!props.onValidate || props.onValidate(event)) && target.checkValidity()) {
			// Let css know that this form was validated and is being submitted.
			target.classList.add('was-validated', 'form-submitting')

			// Serialize form data.
			const data = formToJSON(target.elements)

			// Post process serialized data:
			// Some webform elements require specialized data formatting.
			for (const element of webform.elements) {
				if (data[element.name]) {
					switch (element.type) {
						case 'checkbox':
							data[element.name] = data[element.name][0]
							break
					}
				}
			}

			try {
				// If onSubmit returns false skip submitting to API.
				if (props.onSubmit && (await props.onSubmit(data)) === false) {
					target.classList.remove('form-submitting')
					target.classList.add('form-submitted')
					return
				}

				// Submit form to API.
				const response = await axios.post(props.endpoint, {
					...props.extraData,
					...data,
					webform_id: webform.drupal_internal__id
				})

				if (response.data.error) {
					throw new WebformError(response)
				}

				// Convey current form state.
				target.classList.remove('form-submitting')
				target.classList.add('form-submitted')
				props.onSuccess && props.onSuccess(response.data, data)
			} catch (err) {
				// API should return error structure if validation fails.
				// We use that to render error messages to the form.
				if (err.response && err.response.data.error) {
					setErrors(err.response.data.error)
				}

				// Convey current form state.
				target.classList.remove('form-submitting')
				target.classList.add('form-error')
				props.onError && props.onError(err, data)
			}
		} else {
			// Let css know this form was validated.
			target.classList.add('was-validated', 'form-error')
		}
	}

	return (
		<form
			onSubmit={submitHandler}
			id={props.id}
			className={props.className}
			style={props.style}
			noValidate={props.noValidate}
			data-webform-id={webform.drupal_internal__id}
		>
			{/* Render webform elements */}
			{webform.elements.map((element) => (
				<React.Fragment key={element.name}>
					{renderWebformElement(element, errors[element.name], customComponents![element.type])}
				</React.Fragment>
			))}

			{/* Render default submit button if it is not defined in elements array. */}
			{webform.elements.find((element) => element.type === 'webform_actions') === undefined && (
				<button type="submit">{DEFAULT_SUBMIT_LABEL}</button>
			)}
		</form>
	)
}

Webform.defaultProps = {
	customComponents: {}
}

export default Webform
