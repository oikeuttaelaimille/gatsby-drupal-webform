# Gatsby Drupal Webform

[![Build Status](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform.svg?branch=master)](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform)

React component for [webforms](https://www.drupal.org/project/webform). Goal of this project is to have a react component that generates [bootstrap like](https://getbootstrap.com/docs/4.0/components/forms/) HTML from webform YAML configuration.

### Setup

* **Install [drupal dependency](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/modules/gatsby_webform)**.
* **Give `access any webform configuration` permission to user [accesssing](https://www.gatsbyjs.org/packages/gatsby-source-drupal/#basic-auth) Drupal jsonapi**.
* Enable [CORS](https://www.drupal.org/node/2715637) or serve drupal from same domain as frontend for submitting to work. For development I recommend settings up [Gatsby API proxy](https://www.gatsbyjs.org/docs/api-proxy/) (see [example](./examples/gatsby-webforms/gatsby-config.js#L22-L25)). 

```
npm install --save gatsby-drupal-webform
```

### Example

* [Gatsby project](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/gatsby-webforms)
* [Drupal project](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/drupal)

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

### Custom components

I'm not sure if it is possible to make generic component for every element webform supports (and I'm trying to keep this project simple). That is why this component tries to be easily extensible with custom element types. See: [WebformEntityRadios](https://github.com/oikeuttaelaimille/gatsby-drupal-webform/tree/master/examples/gatsby-webforms/src/components/WebformEntityRadios.jsx) for an example.

