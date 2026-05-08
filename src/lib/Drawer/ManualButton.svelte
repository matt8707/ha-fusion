<script lang="ts">
	import { lang } from '$lib/Stores';
	import Icon from '@iconify/svelte';
	import { base } from '$app/paths';
</script>

<a class="button" href="{base}/ha-fusion-manual.html" target="_blank" rel="noopener noreferrer">
	<figure>
		<Icon icon="solar:book-2-bold-duotone" height="none" />
	</figure>

	<span>{$lang('docs')}</span>
</a>
