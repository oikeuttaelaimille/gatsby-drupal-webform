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

	return (
		<WebformElementWrapper className="form-group form-check" settings={settings} error={error} labelFor={id}>
			<input defaultChecked={!!defaultValue} {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformCheckbox
