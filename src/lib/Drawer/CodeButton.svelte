<script lang="ts">
	import { lang, ripple } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';

	/**
	 * Opens modal
	 */
	function handleClick() {
		openModal(() => import('$lib/Modal/CodeConfig.svelte'));
	}

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Modal/CodeConfig.svelte');
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
		<Icon icon="ph:code-bold" height="none" />
	</figure>

	<span>{$lang('code')}</span>
</button>
