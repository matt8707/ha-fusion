<script lang="ts">
	import { base } from '$app/paths';
	import { dashboard, motion, lang, autocompleteList } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import parser from 'js-yaml';
	import CodeEditor from '$lib/Components/CodeEditor.svelte';
	import Modal from '$lib/Modal/Index.svelte';

	export let isOpen: boolean;

	let transitionend: boolean;
	let message: string | undefined;
	let success = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;

	let reloadView = false;

	$: init = parser.dump($dashboard);
	$: value = init;
	$: changed = init !== value;

	$: if (!changed && !success) message = undefined;

	async function handleKeyDown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			if (!changed) return;
			await save(value);
		}
	}

	function displayError(error: unknown) {
		clearTimeout(timeout);
		success = false;
		message = String(error);
		console.error(error);
	}

	async function save(dashboardData: string) {
		let _value: any;

		try {
			_value = parser.load(dashboardData);
			if (!validate(_value)) return;
		} catch (error) {
			displayError(error);
			return;
		}

		try {
			const response = await fetch(`${base}/_api/save_dashboard`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(_value)
			});

			const data = await response.json();

			if (response.ok && data.message === 'saved') {
				// json
				reloadView = true;
				$dashboard = _value;

				// message
				clearTimeout(timeout);
				success = true;
				message = $lang('saved') + '...';

				timeout = setTimeout(() => {
					message = undefined;
				}, 2500);
			} else {
				displayError(data.message);
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	}

	// extend...
	function validate(data: any): boolean {
		try {
			if (!data) return false;
			const ids: Set<number> = new Set();

			// validate entity_id
			const isValidEntityId = (object: any) => {
				if (
					object.entity_id &&
					(typeof object.entity_id !== 'string' ||
						!object.entity_id.includes('.') ||
						object.entity_id.includes(' '))
				) {
					message = `Invalid entity_id: ${object.entity_id}`;
					displayError(message);
					throw new Error(message);
				}
				return true;
			};

			// validate id
			const isValidId = (id: any) => {
				return typeof id === 'number' && id.toString().length === 13;
			};

			// id collision
			const replaceDuplicateId = (object: any) => {
				while (!isValidId(object.id) || ids.has(object.id)) {
					object.id = randomId();
				}
				ids.add(object.id);
			};

			const handleSection = (section: any) => {
				if (!isValidEntityId(section)) return false;
				replaceDuplicateId(section);

				// items
				if (section.items) {
					for (const item of section.items) {
						if (!isValidEntityId(item)) return false;
						replaceDuplicateId(item);
					}
				}

				// nested sections
				if (section.sections) {
					for (const nestedSection of section.sections) {
						handleSection(nestedSection);
					}
				}
			};

			// sidebar
			if (Array.isArray(data.sidebar)) {
				for (const sidebarItem of data.sidebar) {
					if (!isValidEntityId(sidebarItem)) return false;
					replaceDuplicateId(sidebarItem);
				}
			}

			// view
			if (Array.isArray(data.views)) {
				for (const view of data.views) {
					if (!isValidEntityId(view)) return false;
					replaceDuplicateId(view);

					// sections
					for (const section of view.sections) {
						handleSection(section);
					}
				}
			}

			ids.clear();
			return true;
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
			return false;
		}
	}

	function randomId() {
		const range = 1e13 - 1e12;
		return Math.floor(Math.random() * range) + 1e12;
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if isOpen}
	<Modal size="large" on:transitionend={() => (transitionend = true)}>
		<h1 slot="title">{$lang('raw')}</h1>

		<br />

		<CodeEditor
			{value}
			type="yaml"
			{init}
			bind:reloadView
			{transitionend}
			autocompleteList={$autocompleteList}
			on:change={(event) => {
				value = event.detail;
			}}
		/>

		<div class="grid">
			<div style:overflow="hidden" style:align-self="center">
				{#if message}
					<div
						class="message"
						style:color={success ? '#20df20' : 'red'}
						transition:fade={{ duration: $motion }}
					>
						{success ? message : $lang('error_save_yaml').replace('{error}', message)}
					</div>
				{/if}
			</div>

			<button
				class="done action"
				class:changed
				disabled={!changed}
				style:transition="background-color {$motion / 1.5}ms ease"
				on:click={() => save(value)}
			>
				{$lang('save')}
			</button>
		</div>
	</Modal>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr auto;
		column-gap: 1rem;
		margin-top: 1.8rem;
	}

	.message {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.message:hover {
		cursor: default;
	}

	.changed {
		font-weight: 500 !important;
		color: #3b0f10 !important;
		background-color: #ffc107 !important;
	}

	.done:disabled {
		opacity: 0.5;
	}

	br {
		margin-bottom: 1rem;
	}
</style>
