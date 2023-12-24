<script lang="ts">
	import { lang, motion } from '$lib/Stores';
	import { scale } from 'svelte/transition';
	import Icon from '@iconify/svelte';
</script>

<div transition:scale={{ start: 0.9, duration: $motion }} title={$lang('drag_and_drop')}>
	<div class="icon">
		<Icon icon="mdi:drag" height="none" />
	</div>
</div>

<style>
	.icon {
		width: 1.5rem;
		background: none;
		transform: rotate(90deg);
	}

	div {
		cursor: move;
		margin: 0 0.4rem;
		background-color: var(--theme-button-background-color-off);
		align-items: center;
		border-radius: 0.4rem;
		display: grid;
		overflow: hidden;
	}
</style>
