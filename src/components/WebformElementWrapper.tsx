import React from 'react'

import { WebformSettings } from '../Webform'

interface Props extends React.HTMLProps<HTMLDivElement> {
	settings: WebformSettings
	labelFor?: string
	error?: string
}

/**
 * Return true if element title should be visually hidden.
 */
export function isTitleHidden(webformAttributes: WebformSettings['attributes']) {
	return webformAttributes.title_display === 'invisible'
}

export function getTileStyle(webformAttributes: WebformSettings['attributes']): React.CSSProperties | undefined {
	if (isTitleHidden(webformAttributes)) {
		return {
			position: 'absolute',
			overflow: 'hidden',
			clip: 'rect(1px,1px,1px,1px)',
			width: '1px',
			height: '1px',
			wordWrap: 'normal'
		}
	}

	return undefined
}

export function getTitleDisplay(webformAttributes: WebformSettings['attributes']): 'before' | 'after' {
	return webformAttributes.title_display === 'after' ? 'after' : 'before'
}

export function isElementHidden(states: WebformSettings['states']): boolean {
	return states.hidden === true || states.visible === false
}

const ElementWrapper: React.FC<Props> = ({ children, settings, error, labelFor, ...props }) => {
	const { states, attributes } = settings

	if (states && isElementHidden(states)) {
		return <></>
	}

	const label = (
		<label style={getTileStyle(attributes)} htmlFor={labelFor}>
			{attributes.title}
		</label>
	)

	return (
		<div className="form-group" {...props}>
			{getTitleDisplay(attributes) === 'before' && label}

			{children}

			{getTitleDisplay(attributes) === 'after' && label}

			{error && (
				<div className="form-text invalid-feedback" {...props}>
					{children}
				</div>
			)}

			{attributes.description && (
				<div className="form-text description" {...props} dangerouslySetInnerHTML={{ __html: attributes.description }} />
			)}
		</div>
	)
}

export default ElementWrapper
