<script lang="ts">
	import { timer, selectedLanguage } from '$lib/Stores';

	export let hour12: boolean | undefined = undefined;
	export let seconds: boolean | undefined = undefined;
	export let short_day: boolean | undefined = undefined;
	export let short_month: boolean | undefined = undefined;
	export let year: boolean | undefined = undefined;
	export let hide: string | undefined = undefined;	

	$: time = $timer.toLocaleTimeString($selectedLanguage, {
		hour: hour12 ? 'numeric' : '2-digit',
		minute: '2-digit',
		second: seconds ? '2-digit' : undefined,
		hour12: hour12 === undefined ? false : hour12	
	});
	$: weekDay = $timer.toLocaleDateString($selectedLanguage, {
	    weekday: short_day ? 'short' : 'long'
	});
	$: shortDate = $timer.toLocaleDateString($selectedLanguage, {
		day: 'numeric',
		month: short_month ? 'short' : 'long',
		year: year ? 'numeric' : undefined
	});
</script>

<div
	class="container"
>
	<div class="date">
		{#if hide !== 'day'}
			{weekDay}<br />
		{/if}

		{#if hide !== 'month'}
			{shortDate}<br />
		{/if}
	</div>

	<div class="time">
		{time}
	</div>
</div>	


<style>
	.container {
		display: grid;
		overflow: hidden;
		pointer-events: none;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
		grid-template-columns: auto auto;
		grid-template-areas: 
    		"a b";		
		/* need to specify to properly show emoji */
		font-family: 'Inter Variable';
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
	}

	.date {
		padding: var(--theme-sidebar-item-padding);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		grid-area: a;
	}

	.time {
		padding: var(--theme-sidebar-item-padding);
		font-weight: 500;
		line-height: 2.8rem;
		font-size: 45px;
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-left: -0.1rem;
		grid-area: b;
	}	

	div::first-letter {
		text-transform: capitalize;
	}
</style>

