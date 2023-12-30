import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fastDimension } from 'svelte-fast-dimension';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), fastDimension()],
	kit: {
		adapter: adapter(),
		// handle ingress
		// sveltekit 2, test if 'relative: true' can be removed...
		// https://kit.svelte.dev/docs/migrating-to-sveltekit-2#paths-are-now-relative-by-default
		paths: {
			relative: true
		}
	},
	vitePlugin: {
		exclude: [],
		// dev inspector
		inspector: {
			toggleKeyCombo: 'control-shift',
			showToggleButton: 'never'
		}
	}
};

export default config;
