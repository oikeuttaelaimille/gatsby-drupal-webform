import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformStates, getProps } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformInput: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])
	const { inputProps, webformAttributes } = getProps(element, { name: element.name, type: element.type, id, className: 'form-control' })

	if (element.type === 'hidden') {
		return <input {...inputProps} />
	}

	return (
		<WebformElementWrapper webformAttributes={webformAttributes} states={states} error={error} labelFor={id}>
			<input {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformInput
