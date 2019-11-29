import React from 'react'

import { WebformCustomComponent } from '..'
import { getElementId, useWebformStates, getProps } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const DEFAULT_SELECT_LABEL = '-- Select --'

export const WebformSelect: WebformCustomComponent = ({ element, error }) => {
	const id = getElementId(element.name)
	const states = useWebformStates(element.states || [])
	const { inputProps, webformAttributes } = getProps(element, { name: element.name, id, className: 'form-control' })

	return (
		<WebformElementWrapper webformAttributes={webformAttributes} states={states} error={error} labelFor={id}>
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
