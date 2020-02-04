import React from 'react'

import { WebformSettings } from '../Webform'

interface Props extends React.HTMLProps<HTMLDivElement> {
	settings: WebformSettings
	labelFor?: string
	labelClassName?: string
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
	return states.invisible === true || states.visible === false
}

function classNames(list: Array<undefined | false | string>) {
	const className = list.filter(item => typeof item === 'string').join(' ')

	return className.length > 0 ? className : undefined
}

const ElementWrapper: React.FC<Props> = ({ children, settings, error, labelFor, labelClassName, ...props }) => {
	const { states, attributes } = settings

	const wrapperClassNames = classNames(['form-group', error != null && 'is-invalid', props.className, attributes.wrapper_class])
	// todo: pass required prop here and add css class 'required' etc. to label.
	const labelClassNames = classNames([labelClassName, attributes.label_class])

	if (states && isElementHidden(states)) {
		return <></>
	}

	const label = (
		<label style={getTileStyle(attributes)} className={labelClassNames} htmlFor={labelFor}>
			{attributes.title}
		</label>
	)

	return (
		<div {...props} className={wrapperClassNames}>
			{getTitleDisplay(attributes) === 'before' && label}

			{children}

			{getTitleDisplay(attributes) === 'after' && label}

			{error && (
				<div className="form-text invalid-feedback" {...props}>
					{error}
				</div>
			)}

			{attributes.description && (
				<div className="form-text description" {...props} dangerouslySetInnerHTML={{ __html: attributes.description }} />
			)}
		</div>
	)
}

export default ElementWrapper
