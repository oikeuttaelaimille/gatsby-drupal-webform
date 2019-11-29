import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import { useWebformElement, WebformElementWrapper } from 'gatsby-drupal-webform'

const WebformEntityRadios = ({ element, error }) => {
	const {
		allTaxonomyTermTags: { nodes: tags }
	} = useStaticQuery(graphql`
		{
			allTaxonomyTermTags {
				nodes {
					drupal_internal__tid
					name
				}
			}
		}
	`)

	const [inputProps, settings] = useWebformElement(element, {
		name: element.name,
		type: 'radio'
	})

	return (
		<WebformElementWrapper settings={settings} error={error}>
			{tags.map(({ drupal_internal__tid: tid, name }) => (
				<div className="form-check" key={tid}>
					<input id={`tags-${tid}`} className="form-check" defaultChecked={parseInt(inputProps.defaultValue, 10) === tid} {...inputProps} />
					<label htmlFor={`tags-${tid}`} className="form-check-radio">
						{name}
					</label>
				</div>
			))}
		</WebformElementWrapper>
	)
}

export default WebformEntityRadios
