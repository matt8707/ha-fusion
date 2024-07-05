<script lang="ts">
	import { dashboard, motion, record, lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';
	import { scale } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	export let view: any;
	export let section: any;

	/**
	 * Removes the section from the `sections` array of the view.
	 * After removal, updates the dashboard and records the changes.
	 */
	function handleClick() {
		// section
		if (view.sections.includes(section)) {
			view.sections = view.sections.filter((sec: any) => sec !== section);
		} else {
			// nested
			const stack = view.sections.find((sec: any) => sec.sections?.includes(section));
			if (stack) stack.sections = stack.sections.filter((sub: any) => sub !== section);
		}

		$dashboard = $dashboard;
		$record();
	}
</script>

<button
	title={$lang('remove')}
	transition:scale={{ start: 0.9, duration: $motion }}
	on:click={handleClick}
	on:pointerdown|stopPropagation
	use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
>
	<div class="icon">
		<Icon icon="ic:round-delete" height="none" />
	</div>
</button>

<style>
	button {
		background: #ba0000;
		color: white;
		padding: 0.4rem 0.6rem;
		font-weight: 500;
		float: right;
		font-size: 0.8rem;
		cursor: pointer;
		height: 1.8rem;
		align-items: center;
		border: inherit;
		border-radius: 0.4rem;
		display: flex;
		font-family: inherit;
		overflow: hidden;
		white-space: nowrap;
	}

	.icon {
		width: 1.1rem;
		height: 110%;
	}
</style>
