import React from 'react'

interface Props extends React.HTMLProps<HTMLDivElement> {
	description: string
}

const WebformDescription: React.FC<Props> = ({ description, ...props }) => (
	<div className="form-text description" {...props} dangerouslySetInnerHTML={{ __html: description }} />
)

export default WebformDescription
