<script lang="ts">
	import { motion, lang, ripple } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { scale } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	export let section: any;

	function handleClick() {
		openModal(() => import('$lib/Modal/VisibilityConfig/Index.svelte'), {
			sel: section,
			isItemTemplate: true
		});
	}

	$: conditions = section?.item_visibility_template && section?.item_visibility_template?.length > 0;
</script>

<button
	title={$lang('item_visibility_template')}
	transition:scale={{ start: 0.9, duration: $motion }}
	on:click={handleClick}
	on:pointerdown|stopPropagation
	use:Ripple={{ ...$ripple, color: 'rgba(0, 0, 0, 0.35)' }}
	style:color={conditions ? '#3b0f0f' : 'inherit'}
	style:background-color={conditions
		? 'rgba(0, 200, 220, 0.85)'
		: 'var(--theme-button-background-color-off)'}
	style:transition="background-color {$motion}ms ease"
>
	<div class="icon">
		<Icon icon="lucide:scan-eye" height="none" />
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
