<script lang="ts">
	import { dashboard, motion, record, lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { generateId } from '$lib/Utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let view: any;

	$: noViews = !$dashboard?.views?.length;

	/**
	 * Creates a new section object
	 * in current view
	 */
	function handleClick() {
		if (!view || !view.sections) return;

		// prepend section
		view.sections = [
			{
				type: 'horizontal-stack',
				sections: [],
				id: generateId($dashboard)
			},
			...view.sections
		];

		// trigger reactivity by reassigning to self
		$dashboard = $dashboard;

		$record();

		dispatch('clicked');
	}
</script>

<button
	class="button dropdown"
	on:click={handleClick}
	use:Ripple={{
		...$ripple,
		opacity: noViews ? '0' : $ripple.opacity
	}}
	style:cursor={noViews ? 'unset' : 'pointer'}
	style:opacity={noViews ? '0.5' : '1'}
	style:transition="opacity {$motion}ms ease"
>
	<figure>
		<Icon icon="solar:posts-carousel-horizontal-bold-duotone" height="none" />
	</figure>

	{$lang('horizontal_stack')}
</button>
