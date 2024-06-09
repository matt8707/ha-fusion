<script lang="ts">
	import { showDrawer, motion, lang, ripple } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Ripple from 'svelte-ripple';

	export let handleClick: () => void;

	let menu: HTMLButtonElement;

	/**
	 * Ripple sets position 'relative' on button
	 * Manually set 'absolute' to keep position
	 */
	onMount(() => {
		menu.style.position = 'absolute';
	});

	/**
	 * Preloads module before click event
	 */
	async function handlePointer() {
		await import('$lib/Drawer/Index.svelte');
	}
</script>

<button
	on:click={handleClick}
	bind:this={menu}
	transition:fade={{ duration: $motion }}
	title={$lang('menu')}
	on:pointerenter={handlePointer}
	on:pointerdown={handlePointer}
	use:Ripple={$ripple}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		style:background-color={$showDrawer ? 'rgba(0, 0, 0, 0.2)' : 'transparent'}
	>
		<path
			d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
			style:transform="rotateX({$showDrawer ? 180 : 0}deg)"
			style:transition="transform {$motion / 1.3}ms ease"
		/>
	</svg>
</button>

<style>
	button {
		position: absolute;
		top: 1rem;
		right: 2rem;
		width: 2.7rem;
		background-color: transparent;
		color: white;
		border: none;
		z-index: 1;
		cursor: pointer;
		padding: 0;
		border-radius: 50%;
		height: 2.7rem;
		overflow: hidden;
	}

	svg {
		border-radius: 50%;
	}

	svg path {
		fill: currentColor;
		transform-origin: center center;
	}

	/* Phone and Tablet (portrait) */
	@media all and (max-width: 768px) {
		button {
			right: 1.25rem;
		}
	}
</style>
