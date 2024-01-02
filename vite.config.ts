import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// increase chunk size because of maplibre-gl
		chunkSizeWarningLimit: 800
	},
	ssr: {
		// "cannot use import statement outside a module" because of svelte-ripple
		noExternal: ['svelte-ripple']
	},
	optimizeDeps: {
		include: [
			// include all because of dynamic imports, this prevents: ✨ optimized dependencies changed. reloading
			// (pnpm ls -P | grep -Ev 'codemirror|@fontsource' | awk '/dependencies:/{flag=1; next} flag{print "\047" $1 "\047,"}'; echo "'svelecte/item',"; echo "'@iconify/svelte',"; echo "'svelte-fast-dimension/action'")
			'@jaames/iro',
			'd3-array',
			'd3-scale',
			'd3-shape',
			'dotenv',
			'express',
			'home-assistant-js-websocket',
			'http-proxy-middleware',
			'js-yaml',
			'maplibre-gl',
			'marked',
			'svelecte',
			'svelte-confetti',
			'svelte-dnd-action',
			'svelte-modals',
			'svelte-ripple',
			'svelecte/item',
			'@iconify/svelte',
			'svelte-fast-dimension/action'
		],
		exclude: [
			// exclude codemirror to avoid state duplication
			// pnpm ls -P | grep codemirror | awk '{print "\047" $1 "\047,"}'
			'@codemirror/autocomplete',
			'@codemirror/commands',
			'@codemirror/language',
			'@codemirror/legacy-modes',
			'@codemirror/lint',
			'@codemirror/state',
			'@codemirror/theme-one-dark',
			'@codemirror/view',
			'codemirror'
		]
	},
	// development proxy endpoints
	server: {
		proxy: {
			'/local/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/image_proxy/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/media_player_proxy/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/camera_proxy/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/camera_proxy_stream/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			}
		}
	}
});
