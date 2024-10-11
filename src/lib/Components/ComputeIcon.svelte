<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import Icon from '@iconify/svelte';
	import { states } from '$lib/Stores';
	import { computeIcon } from '$lib/Modal/PictureElements/computeIcon';
	import { getDomain } from '$lib/Utils';

	export let entity_id: string;
	export let getIconString: boolean | undefined = undefined;
	export let skipEntityPicture: boolean | undefined = undefined;
	export let size: string | undefined = undefined;

	let stateObj: any;
	let currentIcon: string | undefined;
	let src: string | undefined;

	$: if (entity_id) stateObj = $states?.[entity_id];

	$: if ($states && entity_id) {
		currentIcon = getCurrentIcon();
	}

	const dispatch = createEventDispatcher();

	function dispatchIconString() {
		if (!getIconString) return;

		const icon = currentIcon
			? currentIcon === 'entity_picture'
				? $states?.[entity_id]?.attributes?.entity_picture
				: currentIcon
			: undefined;

		dispatch('iconString', icon);
	}

	function loadEntityPicture(entity_picture: string) {
		const img = new Image();
		img.onload = () => (src = entity_picture);
		img.onerror = () => (src = undefined);
		img.src = entity_picture;
	}

	onMount(() => {
		dispatchIconString();

		if (currentIcon === 'entity_picture') {
			loadEntityPicture(stateObj?.attributes?.entity_picture);
		}
	});

	function getCurrentIcon() {
		const entity = $states[entity_id];
		const domain = getDomain(entity?.entity_id || entity_id);

		if (stateObj?.attributes?.entity_picture && !skipEntityPicture && domain !== 'update') {
			return 'entity_picture';
		}

		const computedIcon = computeIcon(entity_id, $states);

		dispatchIconString();

		return entity && computedIcon ? computedIcon : 'mdi:room-service';
	}
</script>

{#if currentIcon === 'entity_picture'}
	<!--  entity_picture  -->

	{#if src}
		<img {src} alt="" />
	{:else}
		<Icon icon="ph:image-broken-duotone" height="auto" width="100%" />
	{/if}
{:else if currentIcon}
	<!--  icon  -->

	<Icon icon={currentIcon} style="font-size: {size || '2rem'}" />
{:else if entity_id && stateObj}
	<!-- {(console.warn('icon missing ', entity_id, stateObj), '')} -->
{/if}

<style>
	img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		object-position: center;
	}
</style>
