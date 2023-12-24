<script lang="ts">
	import { authentication, options } from '$lib/Socket';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { page } from '$app/stores';

	// pages
	const paths = [
		'home',
		'animated_icons',
		'calendar_events',
		'clock',
		'dev_tools',
		'docs_markdown',
		'inline_icon',
		'shopping_list',
		'theme_editor',
		'updates',
		'vacuum_map'
	];

	// auth
	let localStorageHassTokens;
	if (browser) {
		const getHassTokens = localStorage.getItem('hassTokens');
		if (getHassTokens) localStorageHassTokens = JSON.parse(getHassTokens)?.hassUrl;

		if (localStorageHassTokens) {
			options.hassUrl = localStorageHassTokens;
			authentication(options);
		}
	}
</script>

<main>
	<div class="nav">
		{#each paths as path}
			{@const url = path === paths[0] ? `${base}/` : `${base}/playground/${path}`}
			{@const active =
				path === paths[0] && $page.url.pathname === '/playground'
					? true
					: $page.url.pathname === url}

			<a
				href={url}
				data-sveltekit-preload-data
				style:text-decoration={active ? 'underline' : 'none'}
				style:opacity={active ? '1' : '0.35'}>{path}</a
			>
		{/each}
	</div>

	<slot />

	<style>
		input,
		textarea,
		button {
			background-color: #363636;
			color: white;
			padding: 0.4rem 0.5rem;
			border: 1px solid rgba(255, 255, 255, 0.15);
			border-radius: 0.4rem;
			margin: 0.1rem;
		}
	</style>
</main>

<style>
	.nav {
		font-size: 0.95rem;
		background-color: #1f1f1f;
		padding: 1.2rem 1.5rem;
		border-radius: 0.4rem;
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
	}

	.nav a {
		color: white;
		margin-right: 1rem;
	}

	main {
		color: white;
		margin: 0 3rem 3rem 3rem;
		font-family: 'Inter Variable';
	}
</style>
