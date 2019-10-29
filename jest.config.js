module.exports = {
	transform: {
		'^.+\\.jsx?$': '<rootDir>/jest-preprocess.js',
		'^.+\\.tsx?$': 'ts-jest'
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.([tj]sx?)$',
	testPathIgnorePatterns: ['/node_modules/', '/examples/', '/web/'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	transformIgnorePatterns: ['node_modules/(?!(gatsby)/)'],
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 95,
			lines: 95,
			statements: 95
		}
	},
	collectCoverageFrom: ['src/**/*.{js,ts,tsx,jsx}']
}
