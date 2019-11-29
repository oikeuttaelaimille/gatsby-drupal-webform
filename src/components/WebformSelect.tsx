import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const DEFAULT_SELECT_LABEL = '-- Select --'

export const WebformSelect: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const [inputProps, settings] = useWebformElement(element, {
		className: 'form-control',
		name: element.name,
		id
	})

	return (
		<WebformElementWrapper settings={settings} error={error} labelFor={id}>
			<select {...inputProps} defaultValue={inputProps.defaultValue || ''}>
				{/** Render placeholder as first element */}
				<option value="" disabled>
					{inputProps.placeholder || DEFAULT_SELECT_LABEL}
				</option>

				{element.options &&
					element.options.map(option => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
			</select>
		</WebformElementWrapper>
	)
}

export default WebformSelect
