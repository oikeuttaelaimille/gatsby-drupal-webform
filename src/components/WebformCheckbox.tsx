import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformStates, getProps } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformCheckbox: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])
	const {
		inputProps: { defaultValue, ...props },
		webformAttributes
	} = getProps(element, { name: element.name, type: element.type, id, className: 'form-check-input' })

	return (
		<WebformElementWrapper
			className="form-group form-check"
			webformAttributes={{ ...webformAttributes, title_display: 'after' }}
			states={states}
			error={error}
			labelFor={id}
		>
			<input defaultChecked={!!defaultValue} {...props} />
		</WebformElementWrapper>
	)
}

export default WebformCheckbox
