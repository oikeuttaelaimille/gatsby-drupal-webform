import React from 'react'

import { WebformCustomComponent } from '..'
import { getOptionId, useWebformElement } from '../utils'

import WebformElementWrapper from './WebformElementWrapper'

export const WebformCheckboxGroup: WebformCustomComponent = ({ element, error }) => {
	const [{ defaultValue, ...inputProps }, settings] = useWebformElement(element, {
		className: 'form-check-input',
		name: element.name,
		type: element.type
	})

	return (
		<WebformElementWrapper settings={settings} error={error}>
			{element.options &&
				element.options.map(option => (
					<div className="form-check" key={option.value}>
						{/** Input for this option. */}
						<input
							id={getOptionId(element.name, option.value)}
							value={option.value}
							defaultChecked={defaultValue === option.value}
							{...inputProps}
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
