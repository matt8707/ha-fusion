<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import { base } from '$app/paths';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	let themes: any;

	/**
	 * Opens modal
	 */
	function handleClick() {
		openModal(() => import('$lib/Modal/AppearanceConfig.svelte'), { themes: themes });
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Modal/AppearanceConfig.svelte');

		try {
			const response = await fetch(`${base}/_api/get_all_themes`);
			const data = await response.json();

			if (response.ok) {
				themes = data;
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

<button
	class="button"
	on:click={handleClick}
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	use:Ripple={$ripple}
>
	<figure style:margin-right="0.1rem">
		<Icon icon="material-symbols:invert-colors-rounded" height="none" />
	</figure>

	<span>{$lang('appearance')}</span>
</button>
