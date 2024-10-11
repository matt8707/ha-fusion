<script lang="ts">
	import { motion } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import Icon from '@iconify/svelte';

	export let showHelp: boolean;

	const data = [
		{
			title: 'Tool',
			items: {
				V: 'Select',
				H: 'Pan',
				Z: 'Zoom',
				Space: 'Quick pan (hold)'
			}
		},
		{
			title: 'Select',
			items: {
				'Cmd + Click': 'Multi-select',
				'Shift + Click': 'Range select',
				'Cmd + A': 'Select all elements'
			}
		},
		{
			title: 'Delete',
			items: {
				Backspace: 'Remove selected element(s)',
				Delete: 'Remove selected element(s)'
			}
		},
		{
			title: 'Position',
			items: {
				Arrow: 'Move selected element(s)',
				'Shift + Drag': 'Constrain to axis'
			}
		},
		{
			title: 'Resize',
			items: {
				'Shift + Drag': 'Free resize (drag handle)',
				'Alt + Drag': 'Resize from center (drag handle)'
			}
		},
		{
			title: 'Rotate',
			items: {
				'Shift + Drag': 'Snap increment (rotation handle)'
			}
		},
		{
			title: 'Zoom',
			items: {
				'Alt + Click': 'Zoom out (zoom tool)',
				'Double-click Pan (H)': 'Fit canvas',
				'Double-click Zoom (Z)': 'Reset zoom'
			}
		},
		{
			title: 'Lock',
			items: {
				'Cmd + L': 'Toggle lock'
			}
		},
		{
			title: 'Visibility',
			items: {
				'Cmd + ,': 'Toggle visibility'
			}
		},
		{
			title: 'Duplicate',
			items: {
				'Cmd + J': 'Duplicate element(s)',
				'Alt + Drag': 'Duplicate element(s) (select tool)'
			}
		},
		{
			title: 'Group',
			items: {
				'Cmd + G': 'Group elements / Ungroup group'
			}
		},
		{
			title: 'History',
			items: {
				'Cmd + Z': 'Undo',
				'Cmd + Shift + Z': 'Redo'
			}
		}
	];

	function handleClick() {
		showHelp = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') handleClick();
	}
</script>

<svelte:document on:keydown|stopPropagation={handleKeydown} />

<button transition:fade={{ duration: $motion, easing: expoOut }} on:click={handleClick}>
	<div class="container">
		{#each data as section}
			<div class="section">
				<h2>{section.title}</h2>
				<ul>
					{#each Object.entries(section.items) as [key, value]}
						<li><kbd>{key}</kbd> {value}</li>
					{/each}
				</ul>
			</div>
		{/each}
		<button class="close-overlay">
			<Icon icon="mingcute:close-fill" width="20" height="20" />
		</button>
	</div>
</button>

<style>
	button {
		all: unset;
		position: absolute;
		inset: 0;
		background-color: rgba(24, 24, 24, 0.9);
		backdrop-filter: blur(2rem);
		color: inherit;
		font-family: inherit;
		overflow: hidden;
	}

	.container {
		display: grid;
		gap: 2rem;
		height: 100%;
		overflow-y: auto;
		padding: 1.5rem 3rem 3rem 3rem;
		box-sizing: border-box;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	h2 {
		font-size: 1.2rem;
		font-weight: 600;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	li {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	kbd {
		background-color: rgba(255, 255, 255, 0.125);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		font-weight: 500;
		white-space: nowrap;
		font-family: inherit;
	}

	.close-overlay {
		all: unset;
		position: fixed;
		top: 1.5rem;
		right: 1.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		padding: 0.5rem;
		transition: background-color 0.15s ease;
	}

	.close-overlay:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}

	@media (min-width: 1024px) {
		.container {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 1023px) and (min-width: 768px) {
		.container {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 767px) {
		.container {
			grid-template-columns: 1fr;
		}
	}
</style>
