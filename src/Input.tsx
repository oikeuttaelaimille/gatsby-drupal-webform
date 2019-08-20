import React from 'react'

import FormGroup from './FormGroup'
import { classNames } from './utils'

type InputProps = React.HTMLProps<HTMLInputElement>

interface Props extends InputProps {
	label?: string
	/** Input help message */
	help?: string
	/** Input error message */
	error?: string
}

const Input: React.FunctionComponent<Props> = ({ children, className, error, help, label, ...props }) => (
	<FormGroup className={className}>
		<label>
			<span className={classNames('label', props.required && 'required')}>{label}</span>

			<input className="form-input" {...props} />

			{error && <span className="form-input-error">{error}</span>}
			{help && <span className="form-input-help">{help}</span>}

			{children}
		</label>
	</FormGroup>
)

export default Input
