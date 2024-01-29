<script lang="ts">
	import { timer, selectedLanguage } from '$lib/Stores';

	export let short_day: boolean | undefined = undefined;
	export let short_month: boolean | undefined = undefined;
	export let hide: string | undefined = undefined;
	export let layout: string | undefined = undefined;

	$: weekDay = $timer.toLocaleDateString($selectedLanguage, {
		weekday: short_day ? 'short' : 'long'
	});

	$: shortDate = $timer.toLocaleDateString($selectedLanguage, {
		day: 'numeric',
		month: short_month ? 'short' : 'long'
	});

	$: orientation = layout || 'vertical';
</script>

<div>
	{#if orientation === 'vertical'}
		{#if hide !== 'day'}
			{weekDay}<br />
		{/if}

		{#if hide !== 'month'}
			{shortDate}<br />
		{/if}
	{/if}
	{#if orientation === 'horizontal'}
		{weekDay},&nbsp;{shortDate}
	{/if}
</div>

<style>
	div {
		padding: var(--theme-sidebar-item-padding);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	div::first-letter {
		text-transform: capitalize;
	}
</style>
