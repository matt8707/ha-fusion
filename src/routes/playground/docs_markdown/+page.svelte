<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let selected: string | undefined;
	let docs: any;

	onMount(async () => {
		try {
			const response = await fetch(`${base}/api/get_docs`);
			const data = await response.json();

			if (response.ok) {
				docs = data;

				const startKey = 'Documentation';
				const keys = Object.keys(data);
				selected = keys.includes(startKey) ? startKey : keys[0];
			} else {
				throw new Error(data.message);
			}
		} catch (error) {
			console.error(error);
		}
	});
</script>

{#if docs}
	<div class="container">
		<div class="sidebar">
			{#each Object.keys(docs) as key}
				<button on:click={() => (selected = key)} class:faded={selected !== key}>
					{key}
				</button>
			{/each}
		</div>

		<div class="content">
			{#if selected && docs[selected]}
				<div>
					{@html docs[selected]}

					<style>
						img {
							width: 100%;
							max-width: 60rem;
							border-radius: 0.6rem;
						}

						pre {
							font-family: monospace;
						}
					</style>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	* {
		font-family: 'Inter Variable';
	}

	.container {
		display: grid;
		grid-template-columns: 200px auto;
		height: 100vh;
	}

	.sidebar {
		padding-right: 10px;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
		overflow-y: auto;
	}

	.content {
		padding-left: 2%;
	}

	button {
		display: block;
		margin: 5px 0;
		width: 100%;
		text-align: left;
		cursor: pointer;
		background: none;
		border: none;
		font-weight: bolder;
		font-size: 1.1rem;
		transition: all 100ms ease;
	}

	.faded {
		opacity: 0.2;
	}
</style>
