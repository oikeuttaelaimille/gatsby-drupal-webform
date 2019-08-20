import React from 'react'
import axios from 'axios'
import { graphql } from 'gatsby'

import Form from './Form'
import Textarea from './Textarea'
import Button from './Button'
import { WebformElement, WebformInputElement, WebformOptionsElement } from './WebformElement'
import { formToJSON } from './utils'

export interface WebformObject {
	name: string
	description: string
	status: string
	elements: WebformElement[]
}

interface WebformErrors {
	[name: string]: string
}

interface Props {
	onSubmit?: (data: {}) => void
	onSuccess?: (target: HTMLFormElement, data: {}) => void
	onError?: (error: any) => void

	className?: string
	elements: WebformElement[]
	name: string

	/** Post webform to specific entity */
	entityType?: string

	/** Post webform to specific entity */
	entityId?: number

	/** Form POST endpoint */
	endpoint: string
}

const Webform: React.FC<Props> = ({ className, children, name: webformName, elements, ...props }) => {
	const [errors, setErrors] = React.useState({} as WebformErrors)

	/**
	 * Submit webform
	 *
	 * @param event Form event.
	 */
	const submit: React.FormEventHandler<HTMLFormElement> = async event => {
		event.preventDefault()

		const target = event.currentTarget
		const data = formToJSON(target.elements)

		setErrors({})

		if (props.onSubmit) {
			props.onSubmit(data)
		}

		try {
			// Post form data to endpoint.
			const response = await axios.post(props.endpoint, {
				...data,
				entity_id: props.entityId,
				entity_type: props.entityType,
				webform_id: webformName
			})

			if (response.data.error) {
				throw { response }
			}

			console.log('Success', response.data)

			// Call onSuccess handler.
			if (props.onSuccess) {
				props.onSuccess(target, response.data)
			}
		} catch (err) {
			console.log(err)

			if (err.response && err.response.data.error) {
				setErrors(err.response.data.error)
			}

			// Call onError handler.
			if (props.onError) {
				props.onError(err)
			}

			// Propage to <Form> error handler.
			throw err
		}
	}

	return (
		<Form onSubmit={submit} className={className}>
			{/* Render webform elements */}
			{elements.map(element => renderWebformElement(element, errors[element.name]))}

			{/* Render submit button if it is not defined in elements structure. */}
			{elements.find(element => element._type === 'webform_actions') === undefined && <Button type="submit">Submit</Button>}

			{/* This should be directly below submit button */}
			{children}
		</Form>
	)
}

/**
 * Render single webform element.
 */
const renderWebformElement = (element: WebformElement, error?: string) => {
	switch (element._type) {
		case 'textfield':
		case 'email':
		case 'tel':
			return <WebformInputElement key={element.name} element={element} error={error} />
		case 'checkbox':
		case 'checkboxes':
		case 'radio':
		case 'radios':
			return <WebformOptionsElement key={element.name} element={element} error={error} />
		case 'textarea':
			return (
				<Textarea
					className={error && 'is-invalid'}
					key={element.name}
					name={element.name}
					label={element._title}
					required={element._required}
					defaultValue={element._default_value}
					disabled={element._disabled}
					readOnly={element._readonly}
					error={error}
				/>
			)
		case 'processed_text':
			return <div key={element.name} dangerouslySetInnerHTML={{ __html: element._text }} />
		case 'webform_markup':
			return <div key={element.name} dangerouslySetInnerHTML={{ __html: element._markup }} />
		case 'webform_actions':
			return (
				<Button key={element.name} type="submit">
					{element._submit__label}
				</Button>
			)
		default:
			return (
				<code key={element}>
					<pre>{JSON.stringify({ [name]: element }, null, 2)}</pre>
				</code>
			)
	}
}

export default Webform

export const query = graphql`
	fragment Webform on webform__webform {
		name: drupal_internal__id
		description
		status
		elements {
			name
			_type
			_title
			_title_display
			_default_value
			_description
			_markup
			_maxlength
			_placeholder
			_required
			_submit__label
			_format
			_text
		}
	}
`
