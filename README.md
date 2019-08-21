# Gatsby Drupal Webform

[![Build Status](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform.svg?branch=master)](https://travis-ci.org/oikeuttaelaimille/gatsby-drupal-webform)

React component and graphql fragments for [webforms](https://www.drupal.org/project/webform). Goal of this project is to have a react component that generates [bootstrap like](https://getbootstrap.com/docs/4.0/components/forms/) HTML from webform YAML configuration.

## Usage

### Setup

Install drupal dependencies (TBD). Drupal needs to process jsonapi webform data to more usable format and expose endpoint for submitting forms.


```
npm install --save gatsby-drupal-webform
```

### Example

```jsx
import Webfrom from 'gatsby-drupal-webform'

const MyForm = ({ data: { nodeWebform: node } }) => (
	<Webform
		name={node.relationships.webform.name}
		elements={node.relationships.webform.elements}
		onSuccess={() => navigate('/thank-you')}
		entityType="node"
		entityId={node.drupal_internal__nid}
		endpoint={drupalEndpoint}
	/>
)

const query = graphql`
	query WebformTemplateQuery($drupal_id: String!) {
		nodeWebform(drupal_id: { eq: $drupal_id }) {
			drupal_internal__nid
			relationships {
				webform {
					...Webform
				}
			}
		}
	}

`
```



