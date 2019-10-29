import React from 'react'

const visuallyHiddenStyle: React.CSSProperties = {
	position: 'absolute',
	overflow: 'hidden',
	clip: 'rect(1px,1px,1px,1px)',
	width: '1px',
	height: '1px',
	wordWrap: 'normal'
}

interface Props extends React.HTMLProps<HTMLLabelElement> {
	visuallyHidden?: boolean
}

const WebformLabel: React.FC<Props> = ({ children, visuallyHidden: isHidden, ...props }) => (
	<label style={isHidden ? visuallyHiddenStyle : undefined} {...props}>
		{children}
	</label>
)

export default WebformLabel
