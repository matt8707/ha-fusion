<script lang="ts">
	import { configuration, lang } from '$lib/Stores';

	let token = $configuration?.token;

	function handleFocus(event: FocusEvent) {
		const target = event.target as HTMLInputElement;
		target.type = event.type === 'focus' ? 'text' : 'password';
	}

	const href = 'https://www.home-assistant.io/docs/authentication/#your-account-profile';
</script>

<h2>{$lang('token')}</h2>

<p class="overflow">
	{$lang('docs')} -
	<a {href} target="blank">{href}</a>
</p>

<input
	class="input"
	type="password"
	name="token"
	placeholder={$lang('token')}
	bind:value={token}
	on:focus={handleFocus}
	on:blur={handleFocus}
/>

<style>
	a {
		color: #fa8f92;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	p:hover {
		cursor: default;
	}
</style>
