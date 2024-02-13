<script lang="ts">
	import { lang } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';

	export let isOpen: boolean;
	export let sel: any;
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">
			{$lang('notifications')}
		</h1>

		<p>
			{$lang('no_options')}
		</p>

		<ConfigButtons {sel} />
	</Modal>
{/if}
