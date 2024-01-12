<script lang="ts">
	import { timer, selectedLanguage } from '$lib/Stores';

	export let hour12: boolean | undefined = undefined;
	export let seconds: boolean | undefined = undefined;

	$: time = $timer.toLocaleTimeString($selectedLanguage, {
		hour: hour12 ? 'numeric' : '2-digit',
		minute: '2-digit',
		second: seconds ? '2-digit' : undefined,
		hour12: hour12
	});
</script>

<div>
	{time}
</div>

<style>
	div {
		padding: var(--theme-sidebar-item-padding);
		font-weight: 500;
		line-height: 2.8rem;
		font-size: var(--theme-sizes-sidebar-time);
		text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-left: -0.1rem;
	}
</style>
