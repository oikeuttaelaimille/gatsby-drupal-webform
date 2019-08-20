import React from 'react'

import FormGroup from './FormGroup'
import { classNames } from './utils'

/**
 * Generate random id value
 * @returns {String} randomly generated string
 */
const generateId = (): string =>
	Math.random()
		.toString(36)
		.substring(2, 15)

type InputAttributes = React.HTMLProps<HTMLInputElement>

type CheckboxType = 'checkbox' | 'radio'

interface Props extends InputAttributes {
	label: string
	/** Checkbox type */
	type?: CheckboxType
}

const Checkbox = ({ className, label, ...props }: Props) => {
	const [id] = React.useState(generateId())

	return (
		<FormGroup className={className}>
			<input className={classNames('form-input', `form-input-${props.type}`)} id={id} {...props} />
			<label htmlFor={id}>{label}</label>
		</FormGroup>
	)
}

Checkbox.defaultProps = {
	type: 'checkbox'
}

export default Checkbox
