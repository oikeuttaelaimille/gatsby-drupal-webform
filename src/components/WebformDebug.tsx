import React from 'react'
import { WebformElement } from '../Webform'

interface Props {
	element?: WebformElement
	error?: string
}

const WebformDebug: React.FC<Props> = ({ element, error }) => (
	<code>
		{error}
		<pre>{JSON.stringify(element, null, 2)}</pre>
	</code>
)

export default WebformDebug
