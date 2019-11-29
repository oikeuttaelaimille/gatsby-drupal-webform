import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformStates, getProps } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformTextarea: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])
	const { inputProps, webformAttributes } = getProps(element, { name: element.name, id, className: 'form-control' })

	return (
		<WebformElementWrapper webformAttributes={webformAttributes} states={states} error={error} labelFor={id}>
			<textarea {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformTextarea
