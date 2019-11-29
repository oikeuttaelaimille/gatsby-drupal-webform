import React from 'react'

import { WebformCustomComponent } from '..'
import { getOptionId, useWebformStates, getProps } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformCheckboxGroup: WebformCustomComponent = ({ element, error }) => {
	const states = useWebformStates(element.states || [])
	const {
		inputProps: { defaultValue, ...props },
		webformAttributes
	} = getProps(element, { name: element.name, type: element.type, className: 'form-check-input' })

	return (
		<WebformElementWrapper webformAttributes={webformAttributes} states={states} error={error}>
			{element.options &&
				element.options.map(option => (
					<div className="form-check" key={option.value}>
						{/** Input for this option. */}
						<input
							id={getOptionId(element.name, option.value)}
							value={option.value}
							defaultChecked={defaultValue === option.value}
							{...props}
						/>

						{/** Label for this option. */}
						<label className="form-check-label" htmlFor={getOptionId(element.name, option.value)}>
							{option.label}
						</label>
					</div>
				))}
		</WebformElementWrapper>
	)
}

export default WebformCheckboxGroup
