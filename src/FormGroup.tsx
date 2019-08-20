import React from 'react'

import { classNames } from './utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const FormGroup: React.SFC<Props> = ({ children, className, ...props }) => (
	<div className={classNames('form-group', className)} {...props}>
		{children}
	</div>
)

export default FormGroup
