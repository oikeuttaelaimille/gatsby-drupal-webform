import React from 'react'

import { useWebformStates, getProps } from '../utils'

type WebformStates = ReturnType<typeof useWebformStates>
type WebformAttributes = ReturnType<typeof getProps>['webformAttributes']

interface Props extends React.HTMLProps<HTMLDivElement> {
	labelFor?: string
	states: WebformStates
	webformAttributes: WebformAttributes
	error?: string
}

/**
 * Return true if element title should be visually hidden.
 */
function isTitleHidden(webformAttributes: WebformAttributes) {
	return webformAttributes.title_display === 'invisible'
}

export function getTileStyle(webformAttributes: WebformAttributes): React.CSSProperties | undefined {
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

export function getTitleDisplay(webformAttributes: WebformAttributes): 'before' | 'after' {
	return webformAttributes.title_display === 'after' ? 'after' : 'before'
}

export function isElementHidden(states: WebformStates): boolean {
	return states.hidden === true || states.visible === false
}

const ElementWrapper: React.FC<Props> = ({ children, className, labelFor, states, webformAttributes, error, ...props }) => {
	if (states && isElementHidden(states)) {
		return <></>
	}

	const label = (
		<label style={getTileStyle(webformAttributes)} htmlFor={labelFor}>
			{webformAttributes.title}
		</label>
	)

	return (
		<div className={className || 'form-group'} {...props}>
			{getTitleDisplay(webformAttributes) === 'before' && label}

			{children}

			{getTitleDisplay(webformAttributes) === 'after' && label}

			{error && (
				<div className="form-text invalid-feedback" {...props}>
					{children}
				</div>
			)}

			{webformAttributes.description && (
				<div className="form-text description" {...props} dangerouslySetInnerHTML={{ __html: webformAttributes.description }} />
			)}
		</div>
	)
}

export default ElementWrapper
