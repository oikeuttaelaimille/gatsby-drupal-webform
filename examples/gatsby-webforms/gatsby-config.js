const DRUPAL_URL = 'http://localhost:8888'

module.exports = {
	siteMetadata: {
		title: `Gatsby Webform`
	},
	plugins: [
		{
			resolve: `gatsby-source-drupal`,
			options: {
				baseUrl: DRUPAL_URL,
				// Gatsby-drupal-webform requires 'Administer webforms' permission.
				basicAuth: {
					username: 'admin',
					password: 'admin'
				}
			}
		}
	]
}
