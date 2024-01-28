<script lang="ts">
	import { configuration, lang } from '$lib/Stores';
	import InputClear from '$lib/Components/InputClear.svelte';
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
		<h3>{$lang('auto')} {$lang('closed')} {$lang('overview')}</h3>
		<div class="container">
			<div>
				<input
					name="dismiss_timeout"
					class="input"
					type="number"
					placeholder="60"
					autocomplete="off"
					spellcheck="false"
					value={data?.configuration?.addons?.['auto_dismiss_modal']?.timeout || ''}
				/>
			</div>
			<div style:margin-left="1.3rem">
				<Toggle
					name="auto_dismiss_modal"
					checked={data?.configuration?.addons?.['auto_dismiss_modal']?.enabled === 'on' || false}
				/>
			</div>
		</div>
	</div>

	<!-- <div class="item">
		<h3>YouTube</h3>

		<input
			class="input"
			type="text"
			placeholder={$lang('entity')}
			name="youtube_watching"
			autocomplete="off"
			spellcheck="false"
			value={data?.configuration?.addons?.['youtube_watching']?.entity_id || ''}
		/>
	</div> -->
</div>

<style>
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

	.grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 0.5rem;
	}

	.container {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
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
