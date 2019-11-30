import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformCheckbox: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const [{ defaultValue, ...inputProps }, settings] = useWebformElement(element, {
		className: 'form-check-input',
		name: element.name,
		type: element.type,
		id
	})

	/**
	 * For checkboxes title should be after the checkbox.
	 * This how I like to make custom checkboxes. :)
	 * @see https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
	 */
	settings.attributes.title_display = 'after'

	return (
		<WebformElementWrapper settings={settings} error={error} className="form-check" labelClassName="form-check-label" labelFor={id}>
			<input defaultChecked={!!defaultValue} {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformCheckbox
