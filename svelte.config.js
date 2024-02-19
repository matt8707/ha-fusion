import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fastDimension } from 'svelte-fast-dimension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), fastDimension()],
	kit: {
		adapter: adapter()
	},
	typescript: {
		config(config) {
			config.include.push('../global.d.ts');
		}
	},
	vitePlugin: {
		// dev inspector
		inspector: {
			toggleKeyCombo: 'control-shift',
			showToggleButton: 'never'
		},
		experimental: {
			// disable console spam because of `svelte-tiny-virtual-list@2.0.5`
			// "The following packages have a svelte field in their packag ..."
			disableSvelteResolveWarnings: true
		}
	}
};

export default config;
