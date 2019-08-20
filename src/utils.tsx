/**
 * @see: https://lengstorf.com/code/get-form-values-as-json/
 */

type HTMLControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is an input, false if not
 */
const isValidElement = (element: HTMLControlElement): boolean => {
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
const isMultiSelect = (element: HTMLControlElement): element is HTMLSelectElement =>
	(element as HTMLSelectElement).options && (element as HTMLSelectElement).multiple

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
const getSelectValues = (options: HTMLOptionsCollection): any[] =>
	[].reduce.call(
		options,
		(values: any, option: HTMLOptionElement) => {
			return option.selected ? values.concat(option.value) : values
		},
		[]
	) as any[]

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
export const formToJSON = (elements: HTMLFormControlsCollection): object =>
	[].reduce.call(
		elements,
		(data: any, element: any) => {
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
	) as {}

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
