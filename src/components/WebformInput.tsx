import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformInput: WebformCustomComponent = ({ element, error }) => {
	// todo: Maybe id attributes and settings should be generated one lever higher = less boilerplate.
	const id = getElementId(element.name)
	const [inputProps, settings] = useWebformElement(element, {
		className: 'form-control',
		name: element.name,
		type: element.type,
		id
	})

	if (element.type === 'hidden') {
		return <input {...inputProps} />
	}

	return (
		<WebformElementWrapper settings={settings} error={error} labelFor={id}>
			<input {...inputProps} />
		</WebformElementWrapper>
	)
}

export default WebformInput
