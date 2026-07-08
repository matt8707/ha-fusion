<script lang="ts">
	/**
	 * DEV modal
	 */

	import { states, lang } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import { getDomain } from '$lib/Utils';

	export let isOpen: boolean;
	export let selected: any;

	const domain = getDomain(selected?.entity_id);
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('unknown')}</h1>

		{#if domain}
			<h2>
				Domain '{domain}' is not yet implemented...<br />
				Please open issue on <a href="https://github.com/matt8707/ha-fusion/issues" target="_blank">GitHub</a>
			</h2>
		{/if}

		<pre>item: {JSON.stringify(selected, undefined, 2)}</pre>

		<hr />

		<pre>entity: {JSON.stringify($states[selected?.entity_id], undefined, 2)}</pre>
	</Modal>
{/if}

<style>
	a,
	h2 {
		color: orange;
		user-select: text;
	}

	pre {
		user-select: text;
		font-size: 0.85rem;
	}

	hr {
		padding: 0;
		margin: 0;
		border: 0;
		height: 0;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: var(--theme-sidebar-divider);
	}
</style>
