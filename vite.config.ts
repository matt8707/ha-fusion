import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// increase chunk size because of maplibre-gl
		chunkSizeWarningLimit: 1000
	},
	ssr: {
		// "cannot use import statement outside a module" because of svelte-ripple
		noExternal: ['svelte-ripple']
	},
	optimizeDeps: {
		include: [
			// include all because of dynamic imports, prevents: ✨ optimized dependencies changed. reloading
			// pnpm ls -P | grep -Ev 'codemirror|@fontsource' | awk '/dependencies:/{flag=1; next} flag{print "\047" $1 "\047,"}'
			'@jaames/iro',
			'd3-array',
			'd3-scale',
			'd3-shape',
			'dotenv',
			'express',
			'hls.js',
			'home-assistant-js-websocket',
			'http-proxy-middleware',
			'js-yaml',
			'konva',
			'maplibre-gl',
			'marked',
			'svelte-confetti',
			'svelte-dnd-action',
			'svelte-modals',
			'svelte-ripple',
			'svelte-tiny-virtual-list',
			'weekstart',
			// dev deps
			'@iconify/svelte',
			'svelte-fast-dimension/action',
			'@event-calendar/core',
			'@event-calendar/day-grid',
			'@event-calendar/list',
			'konva/lib/Shape'
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
	server: {
		// required for webrtc
		host: true,
		// development proxy endpoints
		proxy: {
			'/local/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			},
			'/api/': {
				target: process.env.HASS_URL,
				changeOrigin: true
			}
		}
	}
});
