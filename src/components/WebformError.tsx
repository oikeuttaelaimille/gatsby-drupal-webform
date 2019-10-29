import React from 'react'

interface Props extends React.HTMLProps<HTMLDivElement> {
	error: string
}

const WebformError: React.FC<Props> = ({ error, ...props }) => (
	<div className="form-text invalid-feedback" {...props}>
		{error}
	</div>
)

export default WebformError
