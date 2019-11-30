import { useState, useEffect } from 'react'

import { WebformSettings, WebformElement } from './Webform'
import { formToJSON } from './formToJSON'

/** Webform attribute names that map to object that can be spread to <input> elements. */
export const HTML_ATTRIBUTE_WHITELIST = ['required', 'defaultValue', 'disabled', 'readonly', 'placeholder', 'multiple'] as const

type InputProps = Partial<{ [name in typeof HTML_ATTRIBUTE_WHITELIST[number]]: any }>

/** Item type of state property in webform element */
type State = Exclude<WebformElement['states'], undefined>[number]

// Re-export
export { formToJSON }

/**
 * Check if form state conditions are true.
 *
 * @param element controlling element
 * @param state webform state
 *
 * @return true if element passes all conditions
 */
function checkConditions(element: Element, conditions: State['condition']): boolean {
	return Object.entries(conditions).every(([condition, value]) => {
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

/**
 * Attempt to guess initial state.
 *
 * This is to have something for the initial render. This is an attempt to
 * reduce flickering and elements jumping around.
 *
 * Guesses:
 *  - If hidden|visible states are present assume they are used to initally hide.
 *
 * @param states
 */
function guessInitialState(states: State[]) {
	const initialState: WebformSettings['states'] = {}

	for (const state of states) {
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

type UseStateCallback = (value: React.SetStateAction<{}>) => void

function handleOnChange(state: State, setState: UseStateCallback, event: Event) {
	const { state: stateName, condition } = state
	const element = event.currentTarget as Element

	setState(prevState => ({
		...prevState,

		[stateName]: checkConditions(element, condition)
	}))
}

function useWebformStates(webformStates: State[]) {
	const [states, setStates] = useState(guessInitialState(webformStates))

	useEffect(() => {
		const initialState: typeof states = {}

		// Keep track of all elements and their callbacks so they can be cleaned.
		const callbacks: [HTMLElement, (event: Event) => void][] = []

		// This loop does nothing if webformStates is empty.
		for (const state of webformStates) {
			// Webform uses jQuery selector that are prefixed with ':input'.
			// Strip leading ':' and hope it will not break horribly. :)
			// It will not work with textarea or select...
			const selector = state.selector.substr(1)
			const element = document.querySelector<HTMLElement>(selector)

			if (element) {
				// Compute initial value for each state.
				initialState[state.state] = checkConditions(element, state.condition)

				const callback = handleOnChange.bind(null, state, setStates)

				// Setup listener for state change.
				element.addEventListener('change', callback)

				callbacks.push([element, callback])
			}
		}

		// Set calculated initial state.
		if (Object.entries(initialState).length > 0) {
			setStates(initialState)
		}

		return () => {
			// Remove all callbacks.
			for (const [element, callback] of callbacks) {
				element.removeEventListener('change', callback)
			}
		}
	}, webformStates)

	return states
}

/**
 * Return true if attribute should be spred to <input /> elements.
 *
 * @param attribute attribute name
 */
function isHTMLAttribute(attribute: string): attribute is typeof HTML_ATTRIBUTE_WHITELIST[number] {
	// Compare attribute name against whitelist.
	return HTML_ATTRIBUTE_WHITELIST.includes(attribute as typeof HTML_ATTRIBUTE_WHITELIST[number])
}

/**
 * Transform webform attribute name
 *
 * @param attribute attribute name
 */
function transformAttributeName(attribute: string): string {
	// Handle special cases in a switch statement.
	switch (attribute) {
		case '#readonly':
			return 'readOnly'
		case '#default_value':
			return 'defaultValue'
		// Remove leading '#':
		default:
			return attribute.substr(1)
	}
}

/**
 * Transform WebformElement
 *
 * @param element webform element
 * @param options custom properties
 */
export function useWebformElement<T extends {}>(element: WebformElement, options?: T): [InputProps & T, WebformSettings] {
	const states = useWebformStates(element.states || [])

	const inputProps = {} as InputProps & T
	const attributes = {} as WebformSettings['attributes']

	/**
	 * This will parse webform attributes and return object containing
	 * the props that you can spread over the <input /> element and other
	 * unrecognized attributes.
	 */
	element.attributes.forEach(attribute => {
		const transformedAttribute = transformAttributeName(attribute.name)

		if (isHTMLAttribute(transformedAttribute)) {
			inputProps[transformedAttribute] = attribute.value
		}

		attributes[transformedAttribute] = attribute.value
	})

	// Convert inputProps to correct type.
	Object.assign(inputProps, {
		required: inputProps.required === 'true'
	})

	if (options) {
		// Overwrite inputProps with option props.
		Object.assign(inputProps, options)
	}

	return [inputProps, { attributes, states }]
}

export function getOptionId(name: string, value: string) {
	return `form-${name.replace('_', '-')}-${value.toLowerCase().replace('_', '-')}`
}

/**
 * Generate id for form element
 *
 * @param name element name
 */
export function getElementId(name: string) {
	return `form-${name.replace('_', '-')}`
}

/**
 * Get and return attribute from array of WebformAttributes.
 *
 * @param attributeName name of the attribute to find.
 * @param attributes list of attributes to search.
 * @returns value of attribute if found or undefined.
 */
export function getAttributeValue(attributeName: string, element: WebformElement): string | undefined {
	// Find desired attribte
	const attribute = element.attributes.find(attribute => attribute.name === attributeName)

	if (attribute) {
		return attribute.value
	}

	return undefined
}
