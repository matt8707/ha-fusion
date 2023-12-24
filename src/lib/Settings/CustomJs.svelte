<script lang="ts">
	import { customJs, lang } from '$lib/Stores';
	import Toggle from '$lib/Components/Toggle.svelte';
</script>

<div class="container">
	<div>
		<h2>{$lang('javascript_module')}</h2>
		<p><code>/data/custom_javascript.js</code></p>
	</div>

	<div style:margin-top="1.3rem">
		<Toggle bind:checked={$customJs} />
	</div>

	<input type="hidden" bind:value={$customJs} name="custom_js" />
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

	code {
		font-size: 0.9rem;
		background-color: rgba(0, 0, 0, 0.2);
		padding: 0.2rem 0.4rem;
		border-radius: 0.4rem;
	}
</style>
