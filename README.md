# Gatsby Drupal Webform

[![Build Status](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform.svg?branch=master)](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform)

React component for [webforms](https://www.drupal.org/project/webform). Goal of this project is to have a react component that generates [bootstrap like](https://getbootstrap.com/docs/4.0/components/forms/) HTML from webform YAML configuration.

### Setup

* **Install [drupal dependency](https://www.drupal.org/project/react_webform_backend)**.
* Enable REST resource "Webform Submit".
* **Give `access any webform configuration` permission to user [accesssing](https://www.gatsbyjs.org/packages/gatsby-source-drupal/#basic-auth) Drupal jsonapi**.
* If your frontend is hosted on a different domain make sure browser has cross origin access to REST resource.

```
npm install --save gatsby-drupal-webform
```

### Example

* [Gatsby project](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/gatsby-webforms)
* [Drupal project](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/drupal)

```jsx
import Webfrom from 'gatsby-drupal-webform'

import { navigate } from 'gatsby'

const ContactForm = ({ data: { webformWebform: webform } }) => (
	<Webform
		webform={webform}
		endpoint="http://localhost:8888/react_webform_backend/submit"
		onSuccess={(response) => navigate(response.settings.confirmation_url)}
	/>
)

const query = graphql`
	query {
		webformWebform(drupal_internal__id: { eq: "contact" }) {
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
```

### Custom components

This module only provides basic components (textfield, number, textarea etc.) out of the box. More advanced webform components or composite components should be built as custom components. See: [WebformEntityRadios](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/gatsby-webforms/src/components/WebformEntityRadios.jsx) for an example.

```jsx
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
					<inputid={`tags-${tid}`} className="form-check" defaultChecked={parseInt(inputProps.defaultValue, 10) === tid} {...inputProps} />
					<label htmlFor={`tags-${tid}`} className="form-check-radio">
						{name}
					</label>
				</div>
			))}
		</WebformElementWrapper>
	)
}

const SelectTagForm = () => (
	<Webform
		id="webform"
		webform={props.data.webformWebform}
		endpoint={config.env.ENDPOINT}
		customComponents={{
			webform_entity_radios: WebformEntityRadios
		}}
		onSuccess={() => {
			setSubmitted(true)
		}}
	/>
)

```

