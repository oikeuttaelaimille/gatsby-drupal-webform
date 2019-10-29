/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
	const { createPage } = actions

	const allWebforms = await graphql(`
		query {
			allWebformWebform {
				nodes {
					drupal_internal__id
				}
			}
		}
	`)

	// Check grapql errors
	if (allWebforms.errors) {
		throw new Error(allWebforms.errors)
	}

	allWebforms.data.allWebformWebform.nodes.forEach(({ drupal_internal__id }) => {
		createPage({
			path: drupal_internal__id,
			component: path.resolve(`./src/templates/form.jsx`),
			// Additional data passed to template query
			context: {
				webform_id: drupal_internal__id
			}
		})
	})
}
