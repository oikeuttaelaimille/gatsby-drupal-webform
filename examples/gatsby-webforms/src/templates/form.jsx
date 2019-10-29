import React, { useState } from 'react'

import { graphql } from 'gatsby'

import Webform from 'gatsby-drupal-webform'

const IndexPage = props => {
	const [submitted, setSubmitted] = useState(false)

	return (
		<div>
			<h1>Hi people</h1>
			<p>Welcome to your new Gatsby site.</p>

			{/** Point endpoint to your drupal backend. If Drupal is on a different domain you need to enable CORS headers. */}
			<Webform
				id="webform"
				webform={props.data.webformWebform}
				endpoint="http://localhost:8000/gatsby_webform/submit"
				onSuccess={() => {
					setSubmitted(true)
				}}
			/>

			{submitted && <h2>Message sent!</h2>}
		</div>
	)
}

export default IndexPage

export const pageQuery = graphql`
	query FormTemplateQuery($webform_id: String!) {
		webformWebform(drupal_internal__id: { eq: $webform_id }) {
			drupal_internal__id
			elements {
				name
				type
				attributes {
					name
					value
				}
			}
		}
	}
`
