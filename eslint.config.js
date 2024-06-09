import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				DndEvent: 'readonly'
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	},
	/*
	 * Temporarily disable certain rules to mitigate
	 * unnecessary distractions during development.
	 */
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'svelte/no-at-html-tags': 'off'
		}
	}
];
