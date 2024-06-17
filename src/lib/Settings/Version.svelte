<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { lang, ripple } from '$lib/Stores';
	import Ripple from 'svelte-ripple';

	const debug = false;

	let installed: string;
	let latest: string;
	let last_updated: string;

	let timeout: ReturnType<typeof setTimeout>;
	let busy = false;
	let error_code: number;

	onMount(async () => {
		try {
			const response = await fetch(`${base}/_api/version`, {
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			const diff = data?.last_updated
				? new Date().getTime() - new Date(data.last_updated).getTime()
				: Infinity;

			// fetch new data if missing or older than a day
			if (diff > 86400000) {
				if (debug) console.debug('stale version');
				await fetchLatest();
			} else {
				installed = data?.installed;
				latest = data?.latest;
				last_updated = data?.last_updated;
				if (debug) console.debug('version loaded from file:', latest);
			}
		} catch (err) {
			console.error(err);
		}
	});

	async function fetchLatest() {
		clearTimeout(timeout);

		try {
			if (debug) console.debug('fetching latest version from github');
			const url = 'https://api.github.com/repos/matt8707/ha-fusion/releases/latest';
			const response = await fetch(url);

			if (!response.ok) {
				error_code = response.status;
				console.error(response.status);
			}

			const data = await response.json();

			latest = data?.tag_name;

			// save latest data
			if (latest) save(latest);
		} catch (err) {
			console.error(err);
		}
	}

	async function save(latest: string) {
		try {
			if (debug) console.debug('saving version file');

			last_updated = new Date().toISOString();

			const response = await fetch(`${base}/_api/version`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					latest,
					installed,
					last_updated
				})
			});

			const result = await response.json();

			if (result?.message === 'success') {
				// add frontend ui response
				if (debug) console.debug('version file saved');
			}
		} catch (err) {
			console.error(err);
		} finally {
			timeout = setTimeout(() => {
				busy = false;
			}, 750);
		}
	}

	function compare(installed: string, latest: string) {
		return latest.localeCompare(installed, undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	}
</script>

<div>
	<span>
		<h2>Version</h2>
		<p>
			{#if installed && latest}
				{#if compare(installed, latest) > 0}
					{$lang('update_available')} {latest}
				{:else}
					{$lang('update_up_to_date')} {installed}
				{/if}

				<a href="https://github.com/matt8707/ha-fusion/releases" target="_blank">
					{$lang('update_release_notes')}
				</a>
			{:else if error_code}
				{$lang('error')}: {error_code}
			{:else}
				{$lang('loading')}
			{/if}
		</p>
	</span>

	<button
		class="action done"
		on:click|preventDefault={() => {
			busy = true;
			fetchLatest();
		}}
		use:Ripple={{
			...$ripple,
			color: 'rgba(0, 0, 0, 0.35)'
		}}
	>
		{$lang(busy ? 'checking_updates' : 'check_updates')}
	</button>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		align-items: center;
	}

	button {
		margin-top: 2rem;
		max-width: 12rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	a {
		color: #00dbff;
	}
</style>
