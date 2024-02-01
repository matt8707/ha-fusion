import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fastDimension } from 'svelte-fast-dimension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), fastDimension()],
	kit: {
		adapter: adapter()
	},
	vitePlugin: {
		// dev inspector
		inspector: {
			toggleKeyCombo: 'control-shift',
			showToggleButton: 'never'
		},
		experimental: {
			// disable console spam because of `svelecte@3.17.2` and `svelte-tiny-virtual-list@2.0.5`
			// "The following packages have a svelte field in their package.json but no exports ..."
			disableSvelteResolveWarnings: true
		}
	}
};

export default config;
