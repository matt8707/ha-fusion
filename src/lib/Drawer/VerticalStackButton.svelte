<script lang="ts">
	import { dashboard, motion, record, lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { generateId } from '$lib/Utils';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let view: any;

	$: noViews = !$dashboard?.views?.length;

	function handleClick() {
		if (!view || !view.sections) return;

		view.sections = [
			{
				type: 'vertical-stack',
				sections: [],
				id: generateId($dashboard)
			},
			...view.sections
		];

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
		<Icon icon="gg:row-first" height="none" />
	</figure>

	{$lang('vertical_stack')}
</button>
