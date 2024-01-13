<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';

	export let data: any;

	/**
	 * Gets languages and opens modal
	 */
	async function handleClick() {
		openModal(() => import('$lib/Settings/Index.svelte'), { data });
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		const module = await import('$lib/Settings/Index.svelte');
		module.default;
	}
</script>

<button
	class="button"
	on:click={handleClick}
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	use:Ripple={$ripple}
>
	<figure>
		<Icon icon="clarity:settings-solid" height="none" />
	</figure>

	<span>{$lang('settings')}</span>
</button>
