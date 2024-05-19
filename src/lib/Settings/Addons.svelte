<script lang="ts">
	import { lang, youtubeAddon } from '$lib/Stores';
	import { openModal } from 'svelte-modals';
	import Toggle from '$lib/Components/Toggle.svelte';

	export let data: any;

	function handleFocus(event: FocusEvent) {
		const target = event.target as HTMLInputElement;
		target.type = event.type === 'focus' ? 'text' : 'password';
	}

	const href = 'https://github.com/matt8707/ha-fusion/blob/main/static/documentation/Map.md';
</script>

<h2>{$lang('addons')}</h2>

<p class="overflow">
	{$lang('docs')} -
	<a {href} target="blank">{href}</a>
</p>

<div class="grid">
	<div class="item">
		<h3>MapTiler</h3>
		<input
			class="input"
			type="password"
			name="maptiler"
			placeholder={$lang('token')}
			autocomplete="new-password"
			value={data?.configuration?.addons?.['maptiler']?.apikey || ''}
			on:focus={handleFocus}
			on:blur={handleFocus}
		/>
	</div>

	<div class="item">
		<h3>YouTube</h3>
		<div class="button-toggle-container">
			<button
				on:click={() => {
					openModal(() => import('$lib/Modal/YoutubeModal.svelte'), {});
				}}
				>{$lang('configure')}
			</button>

			<div class="toggle">
				<input type="hidden" bind:value={$youtubeAddon} name="youtube" />
				<Toggle bind:checked={$youtubeAddon} />
			</div>
		</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 50% 50%;
		gap: 0.5rem;
	}

	.toggle {
		flex-shrink: 0;
	}

	.button-toggle-container {
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: space-between;
		gap: 1rem;
	}

	button {
		border-radius: 0.4em;
		border: none;
		color: inherit;
		padding: 0.55em 0.9em;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		background-color: var(--theme-button-background-color-off);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-shrink: 1;
	}

	.input {
		padding: 0.6rem !important;
		font-size: 0.9rem;
		height: auto;
	}

	.item {
		background-color: rgb(255, 255, 255, 0.025);
		padding: 0.8rem 1rem 1rem 1rem;
		border-radius: 0.4rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	h3 {
		margin-block-start: 0;
		margin-block-end: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		pointer-events: none;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	p:hover {
		cursor: default;
	}

	a {
		color: #fa8f92;
	}
</style>
