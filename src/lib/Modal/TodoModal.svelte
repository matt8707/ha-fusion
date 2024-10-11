<script lang="ts">
	import { states, lang, connection, ripple, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName } from '$lib/Utils';
	import Ripple from 'svelte-ripple';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import Icon from '@iconify/svelte';
	import InputClear from '$lib/Components/InputClear.svelte';
	import { callService } from 'home-assistant-js-websocket';

	export let isOpen: boolean;
	export let sel: any;

	let items: any;
	let todoInput = '';
	let selectedId: boolean | undefined = undefined;
	let tempItemNames: Map<string, string> = new Map();

	$: entity = $states[sel?.entity_id];

	$: anyCompleted = getCompleted(items);

	$: dndOptions = {
		flipDurationMs: $motion,
		dropTargetStyle: {},
		zoneTabIndex: -1
	};

	/**
	 * Checks if any item in items is marked as 'completed'
	 */
	function getCompleted(items: any) {
		if (!items) return;
		return items.some((item: { status: string }) => item.status === 'completed');
	}

	/**
	 * Sorts items, placing item 'completed' status at the end
	 */
	function sortItems() {
		items.sort((a: { status: string }, b: { status: string }) => {
			return (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0);
		});
	}

	/**
	 * Adds a new todo entry
	 */
	function add() {
		if (todoInput === '') return;

		callService($connection, 'todo', 'add_item', {
			entity_id: entity?.entity_id,
			item: todoInput
		});

		todoInput = '';
		tempItemNames.clear();
	}

	/**
	 * Removes all completed items from the todo list
	 */
	function clear() {
		callService($connection, 'todo', 'remove_completed_items', {
			entity_id: entity?.entity_id
		});

		tempItemNames.clear();
	}

	/**
	 * Subscribes to todo list changes
	 */
	onMount(() => {
		$connection?.subscribeMessage(
			(message: any) => {
				if (!message) return;

				// map uid to id for dnd
				items = message.items.map((item: { uid: string }) => ({
					...item,
					id: item.uid
				}));

				sortItems();
			},
			{
				type: 'todo/item/subscribe',
				entity_id: entity?.entity_id
			}
		);
	});

	/**
	 * Handles the renaming of a todo item
	 */
	function handleRename(event: any, uid: string) {
		const newName = event?.target?.value;
		if (!newName) return;

		// store the temp rename to display it before response
		tempItemNames.set(uid, newName);

		callService($connection, 'todo', 'update_item', {
			entity_id: entity?.entity_id,
			item: uid,
			rename: newName
		});
	}

	/**
	 * Handles updating the status of a todo item
	 */
	function handleStatus(event: any, uid: string) {
		const target = event?.target;
		if (!target) return;

		callService($connection, 'todo', 'update_item', {
			entity_id: entity?.entity_id,
			item: uid,
			status: target?.checked ? 'completed' : 'needs_action'
		});

		tempItemNames.clear();
	}

	/**
	 * Blurs the currently focused element
	 * in the document to trigger on:change
	 */
	function handleSubmit() {
		if (document) {
			const activeElement = document?.activeElement as HTMLElement;
			activeElement?.blur();
		}
	}

	/**
	 * Handles drag and drop of a todo item
	 */
	function handleDnd(event: any) {
		items = event.detail.items.map((item: { id: string }) => ({
			...item,
			uid: item.id
		}));

		if (event?.type !== 'finalize') return;

		const uid = event.detail.info.id;
		const previousUid =
			items.findIndex((item: { uid: string }) => item.uid === uid) - 1 >= 0
				? items[items.findIndex((item: { uid: string }) => item.uid === uid) - 1].uid
				: undefined;
		handleReorder(uid, previousUid);
	}

	/**
	 * Handles reordering of a todo item
	 */
	function handleReorder(uid: string, previous_uid: string) {
		$connection?.sendMessage({
			type: 'todo/item/move',
			entity_id: entity?.entity_id,
			uid,
			previous_uid
		});

		tempItemNames.clear();
	}

	/**
	 * Handles 'Enter' key event
	 */
	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Enter') add();
	}
</script>

<svelte:document on:keydown={handleKey} />

{#if isOpen}
	<Modal>
		<!-- ADD -->
		<h2>{$lang('todo_list')}</h2>

		<h1 slot="title">{getName(sel, entity)}</h1>

		<div class="h-container">
			<InputClear
				condition={todoInput}
				let:padding
				on:clear={() => {
					todoInput = '';
				}}
			>
				<input
					placeholder={$lang('add_item')}
					name={$lang('add')}
					class="input"
					type="text"
					autocomplete="off"
					spellcheck="false"
					bind:value={todoInput}
					style:padding
				/>
			</InputClear>

			<form on:submit|preventDefault={add}>
				<button
					class="action done submit"
					type="submit"
					use:Ripple={$ripple}
					disabled={todoInput === ''}
					style:cursor={todoInput ? 'pointer' : 'unset'}
					style:opacity={todoInput === '' ? '0.5' : '1'}
					style:transition="opacity {$motion}ms ease"
				>
					{$lang('add')}
				</button>
			</form>
		</div>

		<!-- ITEMS -->
		{#if items}
			<section
				use:dndzone={{ items, ...dndOptions }}
				on:consider={handleDnd}
				on:finalize={handleDnd}
			>
				{#each items as item (item.uid)}
					<div
						class="todo-item"
						animate:flip={{ duration: dndOptions?.flipDurationMs }}
						style:opacity={item.status === 'completed' ? '0.3' : '1'}
						style:transition="opacity {$motion / 2}ms ease"
						data-exclude-drag-modal
					>
						<div class="label-container">
							<label for={item.uid} class="hitbox">
								<input
									id={item.uid}
									type="checkbox"
									checked={item.status === 'completed' ? true : false}
									class="input-checkbox"
									on:input={(event) => handleStatus(event, item.uid)}
								/>
							</label>

							<span
								class="item-name"
								on:click={async () => {
									selectedId = item.uid;
									const inputElement = document.getElementById(item.uid);

									if (inputElement) {
										inputElement.focus();
									}
								}}
								on:keydown
								role="button"
								tabindex="0"
							>
								{#if selectedId === item.uid}
									<form on:submit={handleSubmit}>
										<input
											id={item.uid}
											value={item.summary}
											class="inputname"
											on:change={(event) => handleRename(event, item.uid)}
											on:blur={() => {
												selectedId = undefined;
											}}
										/>
									</form>
								{:else}
									{tempItemNames.has(item.uid) ? tempItemNames.get(item.uid) : item.summary}
								{/if}
							</span>
						</div>

						<span class="icon">
							<Icon icon="mdi:drag" height="none" />
						</span>
					</div>
				{/each}
			</section>
		{/if}

		<!-- BUTTONS -->
		<div class="add-config-button">
			<button
				class="action"
				class:remove={anyCompleted}
				class:done={!anyCompleted}
				on:click={clear}
				use:Ripple={$ripple}
				style:opacity={!anyCompleted ? '0.3' : '1'}
				disabled={!anyCompleted}
				style:cursor={anyCompleted ? 'pointer' : 'unset'}
				style:transition="opacity {$motion}ms ease, background-color {$motion}ms ease"
			>
				{$lang('clear_items')}
			</button>

			<ConfigButtons {sel} />
		</div>
	</Modal>
{/if}

<style>
	.inputname {
		font-family: inherit;
		background-color: transparent;
		border: none;
		color: inherit;
		font-size: inherit;
		width: 100%;
		margin: 0;
		padding: 0;
		outline: none;
	}

	.action {
		height: fit-content;
		align-self: end;
		white-space: nowrap;
		height: 100%;
	}

	.submit {
		border-radius: 0.6em !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		background-color: rgba(255, 255, 255, 0.1) !important;
	}

	section {
		border-radius: 0.4rem;
		padding: 0 0.2rem;
		gap: 0.4rem;
		display: flex;
		flex-direction: column;
	}

	.todo-item {
		justify-content: space-between;
		border-radius: 0.4rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background-color: rgba(255, 255, 255, 0.08);
		align-items: center;
		display: flex;
		padding: 0 0.8rem 0 0;
	}

	.icon {
		width: 1.5rem;
		background: none;
		transform: rotate(90deg);
		flex-shrink: 0;
	}

	input[type='checkbox'] {
		color-scheme: dark;
	}

	.h-container {
		display: grid;
		grid-template-columns: auto min-content;
		grid-gap: 0.8rem;
		margin-bottom: 1.8rem;
	}

	.label-container {
		display: flex;
		align-items: center;
		flex-grow: 1;
		margin-right: 0.5rem;
		padding: 0.8rem;
		width: 100%;
		justify-content: space-between;
	}

	.input-checkbox {
		width: 1.2rem;
		height: 1.2rem;
		margin-right: 0.5rem;
		cursor: pointer;
	}

	.item-name {
		flex-grow: 1;
		margin-left: 0.5rem;
		cursor: text;
	}

	.add-config-button {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.hitbox {
		display: inline-block;
		padding: 14px 8px 14px 14px;
		margin: -14px -8px -14px -14px;
		cursor: pointer;
	}
</style>
