import { useState, useEffect } from 'react'

import { WebformState, WebformElementStates, WebformElement } from './Webform'

/** Webform attribute names that should be <input> element properties. */
export const HTML_ATTRIBUTE_WHITELIST = ['required', 'defaultValue', 'disabled', 'readonly', 'placeholder', 'multiple'] as const

/**
 * @file Utils
 * @see: https://lengstorf.com/code/get-form-values-as-json/
 */

type HTMLControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is an input, false if not
 */
const isValidElement = (element: any): element is HTMLControlElement => {
	return !!(element.name && element.value)
}

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
const isValidValue = (element: HTMLControlElement) => {
	return !['checkbox', 'radio'].includes(element.type) || (element as HTMLInputElement).checked
}

/**
 * Checks if an input is a checkbox, because checkboxes allow multiple values.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a checkbox, false if not
 */
const isCheckbox = (element: HTMLControlElement): element is HTMLInputElement => element.type === 'checkbox'

/**
 * Checks if an input is a `select` with the `multiple` attribute.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a multiselect, false if not
 */
const isMultiSelect = (element: any): element is HTMLSelectElement => element.options && (element as HTMLSelectElement).multiple

type SelectedValuesReduceCallback = (values: string[], option: HTMLOptionElement) => string[]

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
const getSelectValues = (options: HTMLOptionsCollection) =>
	[].reduce.call<HTMLOptionsCollection, [SelectedValuesReduceCallback, []], ReturnType<SelectedValuesReduceCallback>>(
		options,
		(values, option) => (option.selected ? values.concat(option.value) : values),
		[]
	)

type FormJSON = { [name: string]: string | string[] }
type FormJSONReduceCallback = (data: FormJSON, element: Element) => FormJSON

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
export const formToJSON = (elements: HTMLFormControlsCollection) =>
	[].reduce.call<HTMLFormControlsCollection, [FormJSONReduceCallback, {}], ReturnType<FormJSONReduceCallback>>(
		elements,
		(data, element) => {
			// Make sure the element has the required properties and should be added.
			if (isValidElement(element) && isValidValue(element)) {
				/*
				 * Some fields allow for more than one value, so we need to check if this
				 * is one of those fields and, if so, store the values as an array.
				 */
				if (isCheckbox(element)) {
					data[element.name] = (data[element.name] || []).concat(element.value)
				} else if (isMultiSelect(element)) {
					data[element.name] = getSelectValues(element.options)
				} else {
					data[element.name] = element.value
				}
			}

			return data
		},
		{}
	)

/**
 * Join classNames together.
 * @param  {Array} args classnames
 * @return {String}
 */
export function classNames(...args: (undefined | false | string | number)[]): string {
	const classes = []

	for (const arg of args) {
		if (!arg) continue

		if (typeof arg === 'string' || typeof arg === 'number') {
			classes.push(arg)
		}
	}

	return classes.join(' ')
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

/**
 * Return true if webform attribute represents html attribute
 *
 * @param attribute
 */
function isHTMLAttribute(attribute: string): attribute is typeof HTML_ATTRIBUTE_WHITELIST[number] {
	// Compare attribute name against whitelist.
	return HTML_ATTRIBUTE_WHITELIST.includes(attribute as typeof HTML_ATTRIBUTE_WHITELIST[number])
}

/**
 * Transform webform attribute name to input attribute.
 *
 * @param attributeName
 */
function transformInputProp(attribute: string): string {
	// Handle special cases in a switch statement.
	switch (attribute) {
		case '#readonly':
			return 'readOnly'
		case '#default_value':
			return 'defaultValue'
		// Generic case remove leading '#':
		default:
			return attribute.substr(1)
	}
}

type InputProps = { [name in typeof HTML_ATTRIBUTE_WHITELIST[number]]?: any }

/**
 * This function will parse webform attributes and return object containing
 * the props that you can spread over the <input /> element and other
 * unrecognized attributes.
 *
 * You can optionally call the function with an object to pass them props to
 * the input.
 *
 * @param element webform element
 * @param options other props to input
 */
export function getProps<T extends {}>(element: WebformElement, options?: T) {
	const inputProps: InputProps = {}
	const webformAttributes: { [key: string]: string } = {}

	element.attributes.forEach(attribute => {
		const transformedAttribute = transformInputProp(attribute.name)

		if (isHTMLAttribute(transformedAttribute)) {
			// Webform attribute names need to be transformed to make them valid html attributes.
			inputProps[transformedAttribute] = attribute.value
		} else {
			webformAttributes[transformedAttribute] = attribute.value
		}
	})

	if (options) {
		Object.assign(inputProps, options)
	}

	return {
		inputProps: inputProps as InputProps & T,
		webformAttributes
	}
}
