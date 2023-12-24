<script lang="ts">
	import { lang } from '$lib/Stores';
	import Divider from '$lib/Sidebar/Divider.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import type { SidebarItem } from '$lib/Types';

	export let isOpen: boolean;
	export let sel: SidebarItem;
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('divider')}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<Divider />
		</div>

		<p>
			{$lang('no_options')}
		</p>

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	p {
		color: #ffc008;
		margin-block-start: 0.8rem;
		margin-block-end: 0;
		font-weight: 500;
	}
</style>
