import React from 'react'

import { classNames } from './utils'

interface Props extends React.HTMLProps<HTMLFormElement> {
	scrollToError: boolean
	/** Reset form when submitted. */
	resetOnSubmit: boolean
}

const Form = ({ children, onSubmit, scrollToError, resetOnSubmit, className, ...props }: Props) => {
	/** Form submit handler */
	const validate: React.FormEventHandler<HTMLFormElement> = async event => {
		const form = event.currentTarget
		const valid = form.checkValidity()

		// Let css know this form was validated.
		form.classList.add('was-validated')

		if (valid && onSubmit) {
			try {
				// Add submit stage css classes
				form.className = classNames('form', className, 'was-validated', 'form-submitting')

				// Propagate onSubmit.
				await onSubmit(event)

				// Let css know this form was submitted
				form.className = classNames('form', className, 'form-submittted')

				if (resetOnSubmit) {
					form.reset()
				}
			} catch (err) {
				form.classList.replace('form-submitting', 'form-error')
			}
		} else if (!valid) {
			// Form is not valid - prevent submit.
			event.preventDefault()

			// Scroll to first invalid control.
			if (scrollToError) {
				const invalid = form.querySelectorAll(':invalid')

				if (invalid.length > 0 && invalid[0].parentElement) {
					invalid[0].parentElement.scrollIntoView({
						behavior: 'smooth'
					})
				}
			}
		}
	}

	return (
		<form onSubmit={validate} noValidate={true} className={classNames('form', className)} {...props}>
			{children}
		</form>
	)
}

Form.defaultProps = {
	scrollToError: true,
	resetOnSubmit: true
}

export default Form
