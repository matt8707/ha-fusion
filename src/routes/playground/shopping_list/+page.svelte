<script lang="ts">
	// add animations
	// https://learn.svelte.dev/tutorial/animate

	import { connection } from '$lib/Stores';

	let items: any;
	let input = '';

	// listen for changes
	connection.subscribe((conn) => {
		conn?.subscribeEvents(
			(event: {
				data: {
					action: 'update' | 'add' | 'clear' | 'reorder';
					item: {
						name: string;
						id: string;
						complete: boolean;
					};
				};
			}) => {
				// console.debug(event);
				const action = event?.data?.action;
				const data = event?.data?.item;

				if (!items) {
					console.warn('Items not initialized.');
					return;
				}

				if (action === 'update') {
					const updatedItem = items.find((item: { id: string }) => item.id === data.id);
					if (updatedItem) {
						updatedItem.name = data.name;
						updatedItem.complete = data.complete;
					}
				}

				if (action === 'add') {
					items.push(data);
				}

				if (action === 'clear' || action === 'reorder') {
					list();
				}

				items = items;
			},
			'shopping_list_updated'
		);
	});

	function update(item: { id: number; complete: boolean }) {
		connection.subscribe((conn) =>
			conn?.sendMessage({
				type: 'shopping_list/items/update',
				item_id: item.id,
				complete: item.complete
			})
		);
	}

	function add() {
		if (input !== '') {
			connection.subscribe((conn) =>
				conn?.sendMessage({
					type: 'shopping_list/items/add',
					name: input
				})
			);
			input = '';
		}
	}

	function clear() {
		connection.subscribe((conn) =>
			conn?.sendMessage({
				type: 'shopping_list/items/clear'
			})
		);
	}

	function reorder() {
		connection.subscribe((conn) =>
			conn?.sendMessage({
				type: 'shopping_list/items/reorder',
				item_ids: items.map((item: { id: string }) => item.id)
			})
		);
	}

	function list() {
		connection.subscribe((conn) =>
			conn
				?.sendMessagePromise({
					type: 'shopping_list/items'
				})
				.then((res) => {
					items = res;
				})
		);
	}

	list();
</script>

<div class="grid-container">
	<div class="container">
		<button on:click={clear}>clear selected</button>

		<button on:click={reorder}>trigger reorder message</button>

		<form on:submit|preventDefault={add}>
			<input bind:value={input} placeholder="Enter..." />
			<button type="submit">Add</button>
		</form>

		{#if items}
			<ul>
				{#each items as item (item.id)}
					<p>
						<label>
							<input type="checkbox" bind:checked={item.complete} on:change={() => update(item)} />
							{item.name}
						</label>
					</p>
				{/each}
			</ul>
		{/if}
	</div>

	<iframe src="http://192.168.1.241:8123/shopping-list" title="shopping-list"></iframe>
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: 50% 50%;
		height: 80vh;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: 1px solid gray;
		border-radius: 0.8rem;
	}
</style>
