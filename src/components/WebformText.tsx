import React from 'react'

import { WebformCustomComponent } from '..'
import { useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformText: WebformCustomComponent = ({ element, error }) => {
	const [, settings] = useWebformElement(element, {})

	return (
		<WebformElementWrapper settings={settings} error={error}>
			<div dangerouslySetInnerHTML={{ __html: settings.attributes.text || '' }} />
		</WebformElementWrapper>
	)
}

export default WebformText
