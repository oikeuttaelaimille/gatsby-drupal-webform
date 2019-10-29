/* eslint-disable @typescript-eslint/no-var-requires */

const gatsby = jest.requireActual('gatsby')

module.exports = {
	...gatsby,
	graphql: jest.fn()
}
