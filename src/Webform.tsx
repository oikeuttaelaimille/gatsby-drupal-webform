import React, { useState, FormEvent } from 'react'
import axios from 'axios'
import { graphql } from 'gatsby'

import { formToJSON } from './utils'
import { renderWebformElement, DEFAULT_SUBMIT_LABEL } from './webformRender'

/**
 * Webform object as returned from GraphQL query.
 */
export interface WebformObject {
	drupal_internal__id: string
	description: string
	status: string
	elements: WebformElement[]
}

export type WebformOption = {
	label: string
	value: string
}

export interface WebformStateCondition {
	[key: string]: boolean | string | null
}

/**
 * Webform drupal form api states.
 */
export type WebformState = {
	state: string
	selector: string
	condition: WebformStateCondition
}

/**
 * Webform element attribute.
 */
export type WebformAttribute = {
	name: string
	value: string
}

/**
 * Webform element (e.g. text field input or submit button).
 */
export type WebformElement = {
	name: string
	type: string
	options?: WebformOption[]
	attributes: WebformAttribute[]
	states?: WebformState[]
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
export type WebformSubmitHandler = (
	data: ReturnType<typeof formToJSON>,
	event: FormEvent<HTMLFormElement>
) => void | boolean | Promise<void | boolean>

export type WebformSuccessHandler = (response: any, event: FormEvent<HTMLFormElement>) => void
export type WebformErrorHandler = (err: any, event: FormEvent<HTMLFormElement>) => void

export class WebformError extends Error {
	response: any

	constructor(response: any) {
		super()

		this.response = response
	}
}

/**
 * Element errors returned by Drupal.
 */
type WebformErrors = {
	[name: string]: string
}

interface Props {
	id?: string
	className?: string
	style?: React.CSSProperties

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

	/** Form POST endpoint */
	endpoint: string

	/** Provide custom components that handle specific webform elements. */
	customComponents: { [name: string]: WebformCustomComponent }
}

/**
 * Drupal webform react component.
 */
const Webform = ({ webform, customComponents, ...props }: Props) => {
	const [errors, setErrors] = useState<WebformErrors>({})

	const submitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
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

			try {
				// If onSubmit returns false skip submitting to API.
				if (props.onSubmit && (await props.onSubmit(data, event)) === false) {
					target.classList.replace('form-submitting', 'form-submitted')
					return
				}

				// Submit form to API.
				const response = await axios.post(props.endpoint, {
					...data,
					webform_id: webform.drupal_internal__id
				})

				if (response.data.error) {
					throw new WebformError(response)
				}

				// Convey current form state.
				target.classList.replace('form-submitting', 'form-submitted')
				props.onSuccess && props.onSuccess(event, response.data)
			} catch (err) {
				// API should return error structure if validation fails.
				// We use that to render error messages to the form.
				if (err.response && err.response.data.error) {
					setErrors(err.response.data.error)
				}

				// Convey current form state.
				target.classList.replace('form-submitting', 'form-error')
				props.onError && props.onError(err, event)
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
			data-webform-id={webform.drupal_internal__id}
		>
			{/* Render webform elements */}
			{webform.elements.map(element => (
				<React.Fragment key={element.name}>
					{renderWebformElement(element, errors[element.name], customComponents![element.name])}
				</React.Fragment>
			))}

			{/* Render default submit button if it is not defined in elements array. */}
			{webform.elements.find(element => element.type === 'webform_actions') === undefined && (
				<button type="submit">{DEFAULT_SUBMIT_LABEL}</button>
			)}
		</form>
	)
}

Webform.defaultProps = {
	customComponents: {}
}

export default Webform

export const query = graphql`
	fragment SimpleWebform on webform__webform {
		drupal_internal__id
		elements {
			name
			type
			attributes {
				name
				value
			}
		}
	}
`
