import React, { useState, useEffect } from 'react'

import { WebformElement, WebformAttribute, WebformCustomComponent, WebformState } from './Webform'
import { WebformError, WebformLabel, WebformDescription, WebformDebug } from './components'

export const DEFAULT_SUBMIT_LABEL = 'Submit'
export const DEFAULT_SELECT_LABEL = '-- Select --'

/** Webform attribute names that should be <input> element properties. */
export const HTML_ATTRIBUTE_WHITELIST = ['#required', '#default_value', '#disabled', '#readonly', '#placeholder', '#multiple']

/** Collect generic props in an object */
export type GenericProps = { [key: string]: string }

/** This stores information about WebformState internally */
type WebformElementStates = {
	[key: string]: boolean
}

/**
 * Get and return attribute from array of WebformAttributes.
 *
 * @param attributeName name of the attribute to find.
 * @param attributes list of attributes to search.
 * @returns value of attribute if found or undefined.
 */
function getAttributeValue(attributeName: string, attributes: WebformAttribute[]): string | undefined {
	// Find desired attribte
	const attribute = attributes.find(attribute => attribute.name === attributeName)

	if (attribute) {
		return attribute.value
	}

	return undefined
}

/**
 * Generate id for form element
 *
 * @param name element name
 */
function getElementId(name: string) {
	return `form-${name.replace('_', '-')}`
}

/**
 * Generate id for form option element
 *
 * @param name element name
 * @param value option value
 */
function getOptionId(name: string, value: string) {
	return `form-${name.replace('_', '-')}-${value.toLowerCase().replace('_', '-')}`
}

/**
 * Return true if element title should be visually hidden.
 */
function isTitleHidden(type: string, props: GenericProps) {
	return type === 'hidden' || props['#title_display'] === 'invisible'
}

/**
 * Return true if webform attribute represents html attribute
 *
 * @param attribute
 */
function isHTMLAttribute(attribute: WebformAttribute): boolean {
	// Compare attribute name against whitelist.
	return HTML_ATTRIBUTE_WHITELIST.includes(attribute.name)
}

/**
 * Transform webform attribute name to html attribute.
 *
 * @param attributeName
 */
function transformToHTMLAttribute<T extends HTMLElement>(attributeName: string): keyof React.HTMLProps<T> {
	// Handle special cases in a switch statement.
	switch (attributeName) {
		case '#readonly':
			return 'readOnly'
		case '#default_value':
			return 'defaultValue'
		// Generic case:
		default:
			return attributeName.substr(1) as keyof React.HTMLProps<T>
	}
}

/**
 * Parse webform attributes to HTML attributes and other settings
 *
 * @param attributes webform attributes
 * @param name webform element name
 * @param type webform element type
 */
function parseWebformAttributes<T extends HTMLElement>(
	attributes: WebformAttribute[],
	name: string,
	type?: string
): [React.HTMLProps<T>, GenericProps] {
	const html: React.HTMLProps<T> = { name, type }
	const other: GenericProps = {}

	attributes.forEach(attribute => {
		if (isHTMLAttribute(attribute)) {
			// Webform attribute names need to be transformed to make them valid html attributes.
			html[transformToHTMLAttribute<T>(attribute.name)] = attribute.value
		} else {
			// Else attribute is some other setting
			other[attribute.name] = attribute.value!
		}
	})

	return [html, other]
}

/**
 * Check if form state conditions are true.
 *
 * @param element controlling element
 * @param state webform state
 *
 * @return true if element passes all conditions
 */
function checkConditions(element: Element, state: WebformState): boolean {
	return Object.entries(state.condition).every(([condition, value]) => {
		// Ignore conditions that are not defined for this state.
		if (value == null) {
			return true
		}

		// Check condition:
		switch (condition) {
			case 'checked':
				return (element as HTMLInputElement).checked === true
			case 'unchecked':
				return (element as HTMLInputElement).checked === false
			case 'empty':
				return (element as HTMLInputElement).value === ''
			case 'filled':
				return (element as HTMLInputElement).value !== ''
			default:
				return false
		}
	})
}

function guessInitialState(webformStates: WebformState[]) {
	const initialState: WebformElementStates = {}

	for (const state of webformStates) {
		switch (state.state) {
			case 'hidden':
				initialState[state.state] = true
			case 'visible':
			default:
				initialState[state.state] = false
				break
		}
	}

	return initialState
}

export function useWebformStates(webformStates: WebformState[]) {
	const [states, setStates] = useState(guessInitialState(webformStates))

	// Todo guess initial state.

	useEffect(() => {
		//const handleOnChange: React
		function handleOnChange(this: WebformState, event: Event) {
			const element = event.currentTarget as Element

			setStates({
				...states,
				// Store true if all conditions are true.
				[this.state]: checkConditions(element, this)
			})
		}

		const callbacks: any[] = []
		const initialStates: typeof states = {}

		// This loop does nothing if webformStates is empty.
		for (const state of webformStates) {
			// Selector is jQuery selector. Webform uses ':input' to prefix selectors.
			// Strip leading ':' and hope it will not break horribly. :)
			const selector = state.selector.substr(1)
			const element = document.querySelector(selector) as HTMLInputElement
			const callback = handleOnChange.bind(state)

			// Compute initial value for each state.
			initialStates[state.state] = checkConditions(element, state)

			// Setup listener for state change.
			element.addEventListener('change', callback)

			// Keep track of all elements and their callbacks so they can later be removed.
			callbacks.push([element, callback])
		}

		// Set calculated initial state.
		if (Object.entries(initialStates).length > 0) {
			setStates(initialStates)
		}

		return () => {
			// Remove all callbacks.
			for (const [element, callback] of callbacks) {
				element.removeEventListener('change', callback)
			}
		}
	}, [...webformStates])

	return states
}

function isElementHidden(states: WebformElementStates) {
	return states.hidden === true || states.visible === false
}

interface WebformComponentProps {
	element: WebformElement
	error?: string

	/** Supposed to override element.type. */
	typeOverride?: string
}

/**
 * Render as webform input element.
 */
export const WebformInputElement: React.FC<WebformComponentProps> = ({ typeOverride, element, error }) => {
	const type = typeOverride || element.type
	const [props, other] = parseWebformAttributes<HTMLInputElement>(element.attributes, element.name, type)
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])

	if (isElementHidden(states)) {
		return <></>
	}

	return (
		<div className="form-group">
			<WebformLabel htmlFor={id} visuallyHidden={isTitleHidden(type, other)}>
				{other['#title']}
			</WebformLabel>

			<input id={id} className="form-control" {...props} />

			{/** Render error message if present. */}
			{error && <WebformError error={error} />}

			{/** Render description if present. */}
			{other['#description'] && <WebformDescription description={other['#description']} />}
		</div>
	)
}

/**
 * Render as webform textarea element.
 */
export const WebformTextareaElement: React.FC<WebformComponentProps> = ({ element, error }) => {
	const [props, other] = parseWebformAttributes<HTMLTextAreaElement>(element.attributes, element.name)
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])

	if (isElementHidden(states)) {
		return <></>
	}

	return (
		<div className="form-group">
			<WebformLabel htmlFor={id} visuallyHidden={isTitleHidden(element.type, other)}>
				{other['#title']}
			</WebformLabel>

			<textarea id={id} className="form-control" {...props} />

			{/** Render error message if present. */}
			{error && <WebformError error={error} />}

			{/** Render description if present. */}
			{other['#description'] && <WebformDescription description={other['#description']} />}
		</div>
	)
}

export const WebformSelectElement: React.FC<WebformComponentProps> = ({ element, error }) => {
	const [{ placeholder, ...props }, other] = parseWebformAttributes<HTMLSelectElement>(element.attributes, element.name)
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])

	if (isElementHidden(states)) {
		return <></>
	}

	return (
		<div className="form-group">
			<WebformLabel htmlFor={id} visuallyHidden={isTitleHidden('select', other)}>
				{other['#title']}
			</WebformLabel>

			<select className="form-control" {...props} defaultValue={props.defaultValue || ''}>
				{/** Render placeholder as first element */}
				<option value="" disabled>
					{placeholder || DEFAULT_SELECT_LABEL}
				</option>

				{element.options &&
					element.options.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
			</select>

			{/** Render error message if present. */}
			{error && <WebformError error={error} />}

			{/** Render description if present. */}
			{other['#description'] && <WebformDescription description={other['#description']} />}
		</div>
	)
}

export const WebformCheckboxElement: React.FC<WebformComponentProps> = ({ typeOverride, element, error }) => {
	const type = typeOverride || element.type
	const [{ defaultValue, ...props }, other] = parseWebformAttributes<HTMLInputElement>(element.attributes, element.name, type)
	const states = useWebformStates(element.states || [])

	if (isElementHidden(states)) {
		return <></>
	}

	const id = getElementId(element.name)

	return (
		<div className="form-group form-check">
			<input id={id} className="form-check-input" defaultChecked={!!defaultValue} {...props} />

			<WebformLabel htmlFor={id} visuallyHidden={isTitleHidden(type, other)} className="form-check-label">
				{other['#title']}
			</WebformLabel>

			{/** Render error message if present. */}
			{error && <WebformError error={error} />}

			{/** Render description if present. */}
			{other['#description'] && <WebformDescription description={other['#description']} />}
		</div>
	)
}

export const WebformCheckboxGroup: React.FC<WebformComponentProps> = ({ typeOverride, element, error }) => {
	const type = typeOverride || element.type
	const [{ defaultValue, ...props }, other] = parseWebformAttributes<HTMLInputElement>(element.attributes, element.name, type)
	const states = useWebformStates(element.states || [])

	if (isElementHidden(states)) {
		return <></>
	}

	return (
		<div className="form-group">
			{/** Title for whole group. */}
			<WebformLabel visuallyHidden={isTitleHidden(type, other)}>{other['#title']}</WebformLabel>

			{element.options &&
				element.options.map(option => (
					<div className="form-check" key={option.value}>
						{/** Input for this option. */}
						<input
							id={getOptionId(element.name, option.value)}
							className="form-check-input"
							value={option.value}
							defaultChecked={defaultValue === option.value}
							{...props}
						/>

						{/** Label for this option. */}
						<WebformLabel className="form-check-label" htmlFor={getOptionId(element.name, option.value)}>
							{option.label}
						</WebformLabel>
					</div>
				))}

			{/** Render error message if present. */}
			{error && <WebformError error={error} />}

			{/** Render description if present. */}
			{other['#description'] && <WebformDescription description={other['#description']} />}
		</div>
	)
}

/**
 * Render single webform element.
 */
export function renderWebformElement(element: WebformElement, error?: string, CustomComponent?: WebformCustomComponent) {
	// Render using custom compoennt if provided:
	if (CustomComponent) {
		return <CustomComponent element={element} error={error} />
	}

	// Othervise select renderer based on element type:
	switch (element.type) {
		case 'textfield':
			return <WebformInputElement typeOverride="text" element={element} error={error} />
		case 'textarea':
			return <WebformTextareaElement element={element} error={error} />
		case 'tel':
		case 'number':
		case 'email':
		case 'hidden':
			return <WebformInputElement element={element} error={error} />
		case 'checkbox':
		case 'radio':
			/** Render single checkbox or radio element. */
			return <WebformCheckboxElement element={element} error={error} />
		case 'checkboxes':
			return <WebformCheckboxGroup typeOverride="checkbox" element={element} error={error} />
		case 'radios':
			return <WebformCheckboxGroup typeOverride="radio" element={element} error={error} />
		case 'select':
			return <WebformSelectElement element={element} error={error} />
		case 'processed_text':
			return <div dangerouslySetInnerHTML={{ __html: getAttributeValue('#text', element.attributes) || '' }} />
		// Submit button
		case 'webform_actions':
			return (
				<div className="form-group">
					<button type="submit">{getAttributeValue('#submit__label', element.attributes) || DEFAULT_SUBMIT_LABEL}</button>
				</div>
			)
		// Unknown element type -> render as json string
		default:
			return <WebformDebug element={element} error={error} />
	}
}
