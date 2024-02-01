<script lang="ts">
	import { dashboard, lang, ripple, record } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { generateId } from '$lib/Utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Creates a new sidebar object in sidebar items
	 */
	function handleClick() {
		$dashboard.sidebar = [
			{
				type: 'configure',
				id: generateId($dashboard)
			},
			...$dashboard.sidebar
		];

		$record();

		dispatch('clicked');
	}
</script>

<button class="button dropdown" on:click={handleClick} use:Ripple={$ripple}>
	<figure>
		<Icon icon="solar:sidebar-minimalistic-bold-duotone" height="none" />
	</figure>

	{$lang('sidebar')}
</button>

<style>
	figure {
		/* flip icon */
		transform: scaleX(-1);
	}
</style>
