<script lang="ts">
	import { timer, selectedLanguage } from '$lib/Stores';

	export let short: string[] | undefined = [];
	export let show: string[] | undefined = [];
	export let layout: string | undefined = undefined;

	$: show = show ?? ['day', 'month'];

	$: inlineDate = $timer.toLocaleDateString($selectedLanguage, {
		day: show.includes('day') ? 'numeric' : undefined,
		weekday: show.includes('day') ? (short?.includes('day') ? 'short' : 'long') : undefined,
		month: show.includes('month') ? (short?.includes('month') ? 'short' : 'long') : undefined,
		year: show.includes('year') ? (short?.includes('year') ? '2-digit' : 'numeric') : undefined
	});

	$: weekDay = $timer.toLocaleDateString($selectedLanguage, {
		weekday: short?.includes('day') ? 'short' : 'long'
	});

	$: date = $timer.toLocaleDateString($selectedLanguage, {
		day: 'numeric',
		month: short?.includes('month') ? 'short' : 'long'
	});

	$: year = $timer.toLocaleDateString($selectedLanguage, {
		year: short?.includes('year') ? '2-digit' : 'numeric'
	});

	$: orientation = layout || 'vertical';
</script>

<div>
	{#if orientation === 'horizontal'}
		{inlineDate}
	{:else if orientation === 'vertical'}
		{#each show.sort() as e, i}
			{#if e === 'day'}{weekDay}
			{:else if e === 'month'}{date}
			{:else if e === 'year'}{year}
			{/if}
			{#if i !== show.length - 1}
				<br />
			{/if}
		{/each}
	{/if}
</div>

<style>
	div {
		padding: var(--theme-sidebar-item-padding);
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	div::first-letter {
		text-transform: capitalize;
	}
</style>
