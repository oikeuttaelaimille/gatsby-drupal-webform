import React from 'react'

interface Props extends React.HTMLProps<HTMLButtonElement> {
	type: 'button' | 'submit' | 'reset'
}

const Button: React.FC<Props> = ({ children, ...props }) => (
	<button className="btn" {...props}>
		{children}
	</button>
)

export default Button
