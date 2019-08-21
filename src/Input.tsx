import React from 'react'

import FormGroup from './FormGroup'

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
			<span className="form-control-label">{label}</span>

			<input className="form-control" {...props} />

			{error && <span className="form-text invalid-feedback">{error}</span>}
			{help && <span className="form-text">{help}</span>}

			{children}
		</label>
	</FormGroup>
)

export default Input
