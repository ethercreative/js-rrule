const eslint = require("rollup-plugin-eslint")
	, babel = require("rollup-plugin-babel");

export default {
	input: "./src/index.js",
	output: {
		file: "./dist/index.js",
		format: "umd",
		name: "rrule"
	},
	plugins: [
		eslint({
			parserOptions: {
				ecmaVersion: 7,
				sourceType: "module"
			},
			extends: "eslint:recommended",
			parser: "babel-eslint",
			rules: {
				eqeqeq: [1, "smart"],
				semi: [1, "always"],
				"no-loop-func": [2],
				"no-unused-vars": [1],
				"no-console": [1],
				"no-mixed-spaces-and-tabs": [0],
			},
			env: {
				browser: true,
				es6: true,
			},
		}),
		
		babel({
			babelrc: false,
			presets: [
				[
					require.resolve("babel-preset-env"),
					{
						targets: {
							browsers: [
								"last 2 versions",
								"safari >= 7",
								"ie >= 10"
							]
						},
						modules: false,
					}
				]
			],
			plugins: [
				require.resolve("babel-plugin-external-helpers"),
				require.resolve("babel-plugin-transform-class-properties"),
				require.resolve("babel-plugin-transform-object-rest-spread"),
				require.resolve("babel-plugin-syntax-dynamic-import"),
			],
		}),
	],
};