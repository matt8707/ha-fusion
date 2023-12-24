<script lang="ts">
	import { lang, motion } from '$lib/Stores';
	import Toggle from '$lib/Components/Toggle.svelte';

	let checked = $motion === 190;

	$: $motion = checked ? 190 : 0;
</script>

<div class="container">
	<div>
		<h2>{$lang('motion')}</h2>
		<p>{checked ? $lang('on') : $lang('off')}</p>
	</div>

	<div style:margin-top="1.3rem">
		<Toggle bind:checked />
	</div>

	<input type="hidden" bind:value={checked} name="motion" />
</div>

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
</style>
