<script lang="ts">
	import { base } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';

	let style: HTMLStyleElement;

	onMount(async () => {
		try {
			const response = await fetch(`${base}/_api/custom_css`);
			const data = await response.json();

			if (response.ok) {
				style = document.createElement('style');
				style.id = 'ha-fusion-custom-css';
				style.textContent = data;
				document.head.appendChild(style);
			} else {
				throw new Error(data);
			}
		} catch (err) {
			console.error('Custom CSS', err);
		}
	});

	onDestroy(() => {
		if (style) document.head.removeChild(style);
	});
</script>
