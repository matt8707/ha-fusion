<script lang="ts">
	import { motion, lang, ripple, states, editMode } from '$lib/Stores';
	import { modals, openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { scale } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { handleAllConditions } from '$lib/Conditional';
	import type { Section } from '$lib/Types';

	export let section: Section;

	/**
	 * Opens visibility configuration
	 */
	function handleClick() {
		openModal(() => import('$lib/Modal/VisibilityConfig/Index.svelte'), {
			sel: section
		});
	}

	/**
	 * Handles window resize because no new event listerners are setup in $editMode
	 */
	function handleResize() {
		if ($modals?.length !== 0) return;
		visible = visible;
	}

	/**
	 * Checks if `visibility` exists on current section
	 */
	$: conditions = section?.visibility && section?.visibility?.length > 0;

	/**
	 * Evaluates all conditions in section `visibility`
	 */
	$: visible = handleAllConditions($editMode, $states, section);
</script>

<svelte:window on:resize={handleResize} />

<button
	title={!conditions ? $lang('visibility') : $lang(visible ? 'visible' : 'hidden')}
	transition:scale={{ start: 0.9, duration: $motion }}
	on:click={handleClick}
	on:pointerdown|stopPropagation
	use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
	style:color={conditions ? '#3b0f0f' : 'inherit'}
	style:background-color={conditions ? '#ffc008' : 'var(--theme-button-background-color-off)'}
	style:transition="background-color {$motion}ms ease"
>
	<div class="icon">
		<Icon icon={visible ? 'lucide:eye' : 'lucide:eye-off'} height="none" />
	</div>
</button>

<style>
	button {
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
		margin-right: 0.4rem;
	}

	.icon {
		width: 1.1rem;
		height: 110%;
	}
</style>
