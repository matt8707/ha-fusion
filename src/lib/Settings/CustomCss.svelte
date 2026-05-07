<script lang="ts">
	import { base } from '$app/paths';
	import { customCss, lang, motion } from '$lib/Stores';
	import { fade } from 'svelte/transition';
	import Toggle from '$lib/Components/Toggle.svelte';
	import { onMount } from 'svelte';

	let content = '';
	let saving = false;
	let saved = false;

	onMount(async () => {
		if (!$customCss) return;
		await loadCss();
	});

	$: if ($customCss) loadCss();

	async function loadCss() {
		try {
			const response = await fetch(`${base}/_api/custom_css`);
			if (response.ok) content = await response.json();
		} catch (err) {
			console.error('Custom CSS load', err);
		}
	}

	async function saveCss() {
		saving = true;
		try {
			await fetch(`${base}/_api/custom_css`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			});
			saved = true;
			setTimeout(() => (saved = false), 2500);
		} catch (err) {
			console.error('Custom CSS save', err);
		} finally {
			saving = false;
		}
	}
</script>

<div class="container">
	<div>
		<h2>{$lang('custom_css')}</h2>
		<p><code>/data/custom_style.css</code></p>
	</div>

	<div style:margin-top="1.3rem">
		<Toggle bind:checked={$customCss} />
	</div>

	<input type="hidden" bind:value={$customCss} name="custom_css" />
</div>

{#if $customCss}
	<div class="editor" transition:fade={{ duration: $motion }}>
		<textarea bind:value={content} spellcheck="false" />

		<div class="save-row">
			{#if saved}
				<span class="saved" transition:fade={{ duration: $motion }}>{$lang('saved')}</span>
			{/if}
			<button class="save-btn" on:click={saveCss} disabled={saving}>
				{$lang('save')}
			</button>
		</div>
	</div>
{/if}

<style>
	.container {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	p:hover {
		cursor: default;
	}

	code {
		font-size: 0.9rem;
		background-color: rgba(0, 0, 0, 0.2);
		padding: 0.2rem 0.4rem;
		border-radius: 0.4rem;
	}

	.editor {
		margin-top: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	textarea {
		width: 100%;
		min-height: 180px;
		background-color: rgba(0, 0, 0, 0.25);
		color: inherit;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 0.5rem;
		padding: 0.7rem;
		font-family: monospace;
		font-size: 0.85rem;
		resize: vertical;
		box-sizing: border-box;
		outline: none;
	}

	textarea:focus {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.save-row {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.8rem;
	}

	.save-btn {
		background-color: #ffc107;
		color: #3b0f10;
		font-weight: 500;
		border: none;
		border-radius: 0.4rem;
		padding: 0.5rem 1.2rem;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.saved {
		color: #00dd17;
		font-size: 0.9rem;
	}
</style>
