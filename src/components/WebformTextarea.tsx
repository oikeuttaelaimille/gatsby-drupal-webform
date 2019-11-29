import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformTextarea: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const [inputProps, settings] = useWebformElement(element, {
		className: 'form-control',
		name: element.name,
		id
	})

	return (
		<WebformElementWrapper settings={settings} error={error} labelFor={id}>
			<textarea {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformTextarea
