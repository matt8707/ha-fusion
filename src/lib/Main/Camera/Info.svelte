<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getName } from '$lib/Utils';
	import StateLogic from '$lib/Components/StateLogic.svelte';

	export let sel: any;
	export let entity: any;
</script>

<div class="container">
	<div class="left">
		<div class="icon">
			<Icon icon={'mdi:camera'} height="auto" width="100%" />
		</div>
	</div>

	<div class="right">
		<div class="name">
			{getName(undefined, entity)}
		</div>

		<div class="state">
			<StateLogic entity_id={sel?.entity_id} selected={sel} />
		</div>
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: min-content auto;
		grid-template-areas: 'left right';
		position: absolute;
		align-self: end;
		width: inherit;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(1rem);
		-webkit-backdrop-filter: blur(1rem);
	}

	.name {
		grid-area: name;
		font-weight: 500;
		color: inherit;
		white-space: nowrap;
		color: var(--theme-button-name-color-off);
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 0.95rem;
		margin-top: -1px;
	}

	.state {
		grid-area: state;
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--theme-button-state-color-off);
		font-size: 0.925rem;
		margin-top: 1px;
	}

	.icon {
		--icon-size: 2.4rem;
		grid-area: icon;
		height: var(--icon-size);
		width: var(--icon-size);
		color: rgb(200 200 200);
		background-color: rgba(0, 0, 0, 0.25);
		border-radius: 50%;
		display: grid;
		align-items: center;
		display: flex;
		padding: 0.5rem;
		background-position: center center;
		background-size: cover;
		background-repeat: no-repeat;
	}

	.left {
		display: inherit;
		padding: var(--container-padding);
	}

	.right {
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		padding-right: var(--container-padding);
	}
</style>
