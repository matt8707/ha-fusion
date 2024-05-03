<script lang="ts">
	import { editMode, lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';

	export let url: string | undefined = undefined;
	export let size: string | undefined = undefined;
	export let preview: boolean = false;
</script>

<div style:padding={!preview ? 'var(--theme-sidebar-item-padding)' : 'unset'}>
	{#if url}
		<iframe
			src={url}
			style:height={size || '150px'}
			style:pointer-events={$editMode ? 'none' : 'unset'}
			title={$lang('iframe')}
		></iframe>
	{:else}
		<div class="placeholder center" style:height={size || '150px'}>
			<div class="icon">
				<Icon icon="fontisto:world-o" height="none" />
			</div>
		</div>
	{/if}
</div>

<style>
	iframe,
	.placeholder {
		display: block;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.8rem;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.2);
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		opacity: 0.2;
		width: 3.8rem;
		height: 3.8rem;
	}
</style>
