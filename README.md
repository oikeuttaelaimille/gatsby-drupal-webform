# Gatsby Drupal Webform

[![Build Status](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform.svg?branch=master)](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform)

React component for [webforms](https://www.drupal.org/project/webform). Goal of this project is to provide react component that will generate [bootstrap like](https://getbootstrap.com/docs/4.0/components/forms/) HTML from webform YAML configuration for Gatsby websites.

This module is not yet 100% production ready. Use with caution :).

### Setup

* **Install [drupal dependency](./modules/gatsby_webform)**.
* Enable [CORS](https://www.drupal.org/node/2715637) or serve drupal from same domain as frontend. For development I recommend settings up [Gatsby API proxy](https://www.gatsbyjs.org/docs/api-proxy/) (see [example](./examples/gatsby-webforms/gatsby-config.js#L22-L25)). 

```
npm install --save gatsby-drupal-webform
```

### Example

* [Gatsby project](./examples/gatsby-webforms)
* [Drupal project](./examples/drupal)

```jsx
import Webfrom from 'gatsby-drupal-webform'

const ContactForm = ({ data: { webformWebform: webform } }) => (
	<Webform
		webform={webform}
		endpoint="/gatsby_webform/submit"
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



