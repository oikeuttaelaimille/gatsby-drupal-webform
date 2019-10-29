// Use localhost:8888 (=drush runserver url) if not started in CI environment.
const DRUPAL_URL = process.env.CI ? 'http://drupal.test' : 'http://localhost:8888'

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
	],
	// Proxy api requests
	proxy: {
		prefix: '/gatsby_webform',
		url: DRUPAL_URL
	}
}
