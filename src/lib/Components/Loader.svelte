<script lang="ts">
	import { motion } from '$lib/Stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div in:fade={{ duration: $motion, delay: $motion }}>
		<svg viewBox="0 0 50 50">
			<circle cx="25" cy="25" r="20" />
		</svg>
	</div>
{/if}

<style>
	div {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
	}

	svg {
		-webkit-animation: rotate 2s linear infinite;
		animation: rotate 2s linear infinite;
		z-index: 2;
		width: 8em;
		height: 8em;
		fill: none;
		stroke-width: 3;
	}

	circle {
		stroke: white;
		stroke-linecap: round;
		-webkit-animation: dash 1.5s ease-in-out infinite;
		animation: dash 1.5s ease-in-out infinite;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
</style>
