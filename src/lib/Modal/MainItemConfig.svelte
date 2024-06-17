<script lang="ts">
	// eventually merge with SidebarItemConfig.svelte...

	import { dashboard, record, lang, motion, ripple, states, demo } from '$lib/Stores';
	import { openModal, closeModal } from 'svelte-modals';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import InputClear from '$lib/Components/InputClear.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import {
		getCameraEntity,
		getSensorEntity,
		getMediaPlayerEntity
	} from '$lib/Modal/getRandomEntity';

	import Button from '$lib/Main/Button.svelte';
	import Camera from '$lib/Main/Camera.svelte';
	import ConditionalMedia from '$lib/Main/ConditionalMedia.svelte';
	import Empty from '$lib/Main/Empty.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Ripple from 'svelte-ripple';

	export let isOpen: boolean;
	export let sel: any;

	let searchString = '';
	let searchElement: HTMLInputElement;

	// get random preview entities
	if (!$demo.camera) $demo.camera = getCameraEntity($states);
	if (!$demo.sensor) $demo.sensor = getSensorEntity($states);
	if (!$demo.media_player) $demo.media_player = getMediaPlayerEntity($states);

	onMount(() => {
		if (searchElement) {
			searchElement.focus();
		}

		// if changing type reset object
		if (sel) {
			Object.keys(sel).forEach((key) => {
				if (key !== 'id') {
					delete (sel as any)[key];
				}
			});
			sel.type = 'configure';
			$dashboard = $dashboard;
		}
	});

	$: filter = itemTypes
		.filter(
			({ id, type }) =>
				id.toLowerCase().includes(searchString.toLowerCase()) ||
				type.toLowerCase().includes(searchString.toLowerCase())
		)
		.sort((a, b) => a.type.localeCompare(b.type));

	let itemTypes: {
		id: string;
		type: string;
		component?: any;
		props?: any;
		style?: any;
	}[];

	$: itemTypes = [
		{
			id: 'button',
			type: $lang('button'),
			component: Button,
			props: {
				demo: $demo.sensor,
				sel
			}
		},
		{
			id: 'camera',
			type: $lang('camera'),
			component: Camera,
			props: {
				demo: $demo.camera,
				sel,
				responsive: true,
				controls: false,
				muted: true
			}
		},
		{
			id: 'empty',
			type: $lang('empty'),
			component: Empty,
			props: {
				sel
			}
		},
		{
			id: 'conditional_media',
			type: `${$lang('conditional')} ${$lang('media')?.toLocaleLowerCase()}`,
			component: ConditionalMedia,
			props: {
				demo: $demo.media_player,
				sel
			}
		}
	];

	async function handleClick(id: string) {
		closeModal();

		// set sidebar item type
		if (sel && sel?.type) {
			sel.type = id;
			$dashboard = $dashboard;
		}
		$record();

		switch (sel?.type) {
			case 'button':
				openModal(() => import('$lib/Modal/ButtonConfig.svelte'), {
					demo: $demo.sensor,
					sel
				});
				break;
			case 'camera':
				openModal(() => import('$lib/Modal/CameraConfig.svelte'), {
					demo: $demo.camera,
					sel
				});
				break;
			case 'conditional_media':
				openModal(() => import('$lib/Modal/ConditionalMediaConfig.svelte'), {
					demo: $demo.media_player,
					sel
				});
				break;
			case 'empty':
				openModal(() => import('$lib/Modal/EmptyConfig.svelte'), { sel });
				break;
			default:
				openModal(() => import('$lib/Modal/MainItemConfig.svelte'), { sel });
		}
	}

	/**
	 * Handle keydown when pressing Esc key. Clear
	 * `searchElement` if focused else close modal
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.stopPropagation();

		if (searchElement === document.activeElement && searchString) {
			searchElement.blur();
			searchString = '';
		} else {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown|capture={handleKeydown} />

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{$lang('options')}</h1>

		<div class="search">
			<InputClear
				condition={searchString}
				on:clear={() => {
					searchString = '';
				}}
				let:padding
			>
				<input
					name={$lang('search')}
					class="input"
					type="text"
					placeholder={$lang('search')}
					autocomplete="off"
					spellcheck="false"
					bind:this={searchElement}
					bind:value={searchString}
					style:padding
				/>
			</InputClear>
		</div>

		<div class="container">
			{#each filter as { id, type, component, props, style } (id)}
				<button
					on:click={() => handleClick(id)}
					animate:flip={{ duration: $motion }}
					style:text-align={style?.['text-align'] || 'start'}
					use:Ripple={$ripple}
				>
					<div class="header">
						{type}
					</div>

					<div class="preview" class:camera={id === 'camera'} class:button={id === 'button'}>
						<svelte:component this={component} {...props} />
					</div>
				</button>
			{/each}
		</div>

		<ConfigButtons {sel} disableChangeType={true} />
	</Modal>
{/if}

<style>
	.camera {
		padding: 1rem 1.2rem;
		height: inherit;
	}

	.button {
		display: flex;
		align-self: start;
		min-width: 14.5rem;
	}

	.container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		grid-gap: 1rem;
		overflow: auto;
		align-content: start;
	}

	button {
		display: grid;
		padding: 0;
		font-family: inherit;
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.8em;
		background-color: rgba(0, 0, 0, 0.2);
		height: 10rem;
		outline-offset: -2px;
	}

	.header {
		background-color: rgba(0, 0, 0, 0.2);
		padding: 0.8em 1em 0.7em 1em;
		color: white;
		font-weight: 500;
		display: inline-flex;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 1rem;
		height: min-content;
	}

	.preview {
		color: white;
		padding: 0 1.5rem;
		min-width: -webkit-fill-available;
	}

	.search {
		margin: 1rem 0;
	}
</style>
