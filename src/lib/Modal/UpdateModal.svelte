<script lang="ts">
	import { lang, states, connection, motion, ripple } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import { callService } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { marked } from 'marked';
	import Ripple from 'svelte-ripple';
	import { slide } from 'svelte/transition';

	export let isOpen: boolean;
	export let sel: any;

	let checked = false;
	let installed: boolean;
	let releaseNotes: string | Promise<string>;

	$: entity = $states[sel?.entity_id];
	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;

	$: supports = getSupport(supported_features, {
		INSTALL: 1,
		SPECIFIC_VERSION: 2,
		PROGRESS: 4,
		BACKUP: 8,
		RELEASE_NOTES: 16
	});

	/**
	 * Updates `installed` with a number from `attributes?.in_progress`
	 * `in_progress` cycles through numbers or `false` if not in progress
	 */
	$: if (attributes?.in_progress) installed = attributes?.in_progress;

	$: inProgress = typeof attributes?.in_progress === 'number';
	$: skipped = attributes?.skipped_version === attributes?.latest_version;
	$: latest = attributes?.installed_version === attributes?.latest_version;

	// animate progress, don't use `latest`
	const progress = tweened(attributes?.installed_version === attributes?.latest_version ? 0 : 100, {
		duration: $motion * 2,
		easing: cubicOut
	});

	$: progress.set(inProgress ? attributes?.in_progress : installed ? 100 : 0);

	onMount(async () => {
		if (supports?.BACKUP) {
			checked = true;
		}

		if (supports?.RELEASE_NOTES) {
			try {
				const response = await $connection.sendMessagePromise({
					type: 'update/release_notes',
					entity_id: entity?.entity_id
				});

				if (typeof response === 'string') {
					releaseNotes = marked.parse(response);
				}
			} catch (err) {
				console.error(err);
			}
		}
	});

	/**
	 * Handle install
	 */
	function handleInstall() {
		if (!entity?.entity_id) return;

		callService($connection, 'update', 'install', {
			entity_id: entity?.entity_id,
			backup: checked
		});
	}

	/**
	 * Handle skip/clear_skipped
	 */
	function handleSkip(service: string) {
		if (!entity?.entity_id) return;

		callService($connection, 'update', service, {
			entity_id: entity?.entity_id
		});
	}
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">
			{getName(sel, entity)}
		</h1>

		<h2>
			{$lang('state')}
		</h2>

		<div>
			<StateLogic entity_id={sel?.entity_id} selected={sel} />
		</div>

		<!-- PROGRESS -->
		{#if supports?.PROGRESS}
			<progress
				value={$progress}
				max="100"
				style:opacity={inProgress ? '1' : '0.5'}
				style:transition="opacity {$motion}ms ease"
			></progress>
		{/if}

		<!-- SPECIFIC_VERSION -->
		{#if supports?.SPECIFIC_VERSION}
			<br />
			{#if attributes?.installed_version}
				<div>
					{$lang('update_installed_version')}: {attributes?.installed_version}
				</div>
			{/if}

			{#if attributes?.latest_version}
				<div>
					{$lang('update_latest_version')}: {attributes?.latest_version}
				</div>
			{/if}
		{/if}

		{#if attributes?.release_url}
			<p>
				<a href={attributes?.release_url} target="_blank">{$lang('update_release_notes')}</a>
			</p>
		{/if}

		<!-- RELEASE_NOTES -->
		{#if supports?.RELEASE_NOTES}
			<div class="release-notes" style:display={!releaseNotes ? 'flex' : 'block'}>
				{#if !releaseNotes}
					<img src="loader.svg" alt="loading" class="loader" />
				{:else}
					<div transition:slide={{ duration: $motion }} style:display="inline-block">
						{@html releaseNotes}
					</div>
				{/if}
				<style>
					.release-notes a {
						color: rgb(36 167 255);
					}
				</style>
			</div>
		{/if}

		<!-- BACKUP -->
		{#if supports?.BACKUP}
			<div
				class="label-container"
				style:opacity={latest ? '0.5' : '1'}
				style:cursor={latest ? 'default' : 'pointer'}
			>
				<label for="backup" class="hitbox">
					<input
						id="backup"
						type="checkbox"
						class="input-checkbox"
						bind:checked
						disabled={latest}
						style:cursor={latest ? 'default' : 'pointer'}
					/>
					<span class="item-name">{$lang('update_create_backup')}</span>
				</label>
			</div>
		{/if}

		<!-- ConfigButtons -->
		<div class="add-config-buttons">
			<div class="config-buttons-group">
				{#if supports?.SPECIFIC_VERSION}
					<button
						class="action"
						class:done={skipped}
						class:remove={!skipped}
						on:click={() => handleSkip(skipped ? 'clear_skipped' : 'skip')}
						style:opacity={latest ? '0.5' : '1'}
						disabled={latest}
						use:Ripple={$ripple}
					>
						{$lang(skipped ? 'undo' : 'update_skip')}
					</button>
				{/if}

				{#if supports?.INSTALL}
					<button
						class="done action"
						on:click={handleInstall}
						disabled={latest}
						style:opacity={inProgress || latest ? '0.5' : '1'}
						use:Ripple={$ripple}
					>
						{$lang('update_install')}
					</button>
				{/if}
			</div>

			<ConfigButtons {sel} />
		</div>
	</Modal>
{/if}

<style>
	a {
		color: rgb(36 167 255);
	}

	button[disabled] {
		cursor: default !important;
	}

	.add-config-buttons {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.config-buttons-group {
		display: flex;
		gap: 0.8rem;
	}

	.action {
		height: fit-content;
		align-self: end;
	}

	.release-notes {
		background-color: rgba(0, 0, 0, 0.2);
		padding: 0.4rem 1.7rem 0.6rem 1.7rem;
		border-radius: 0.65rem;
		margin-top: 1.4rem;
		min-height: 8rem;
	}

	.loader {
		margin: 0 auto;
		width: 2rem;
		opacity: 0.75;
	}

	/* -- input[type='checkbox'] -- */

	.label-container {
		display: flex;
		align-items: center;
		flex-grow: 1;
		padding-top: 1.3rem;
		width: 100%;
		justify-content: space-between;
	}

	.input-checkbox {
		width: 1.2rem;
		height: 1.2rem;
		cursor: pointer;
	}

	.item-name {
		flex-grow: 1;
		margin-left: 0.5rem;
	}

	.hitbox {
		display: contents;
	}

	input[type='checkbox'] {
		color-scheme: dark;
	}

	/* -- progress -- */

	progress {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		height: 0.8rem;
		overflow: hidden;
		border: none;
		margin: 0.85rem 0;
	}

	:root {
		--progress-bar-color: #3396ff;
		--progress-border-radius: 0.35rem;
		--progress-background-color: rgba(0, 0, 0, 0.5);
	}

	/* firefox */
	progress[value] {
		background-color: var(--progress-background-color);
		border-radius: var(--progress-border-radius);
	}

	progress[value]::-moz-progress-bar {
		background-color: var(--progress-bar-color);
	}

	/* webkit */
	progress[value]::-webkit-progress-bar {
		background-color: var(--progress-background-color);
		border-radius: var(--progress-border-radius);
	}

	progress[value]::-webkit-progress-value {
		background-color: var(--progress-bar-color);
	}
</style>
