import React from 'react'

import Input from './Input'

type TextareaProps = React.HTMLProps<HTMLTextAreaElement>

interface Props extends TextareaProps {
	label?: string
	/** Help text */
	help?: string
	/** Invalid feedback */
	error?: string
}

const Textarea: React.FunctionComponent<Props> = props => <Input as="textarea" {...(props as any)} />

export default Textarea
