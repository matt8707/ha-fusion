<script lang="ts">
	import { connection, services, states } from '$lib/Stores';
	import { callService, subscribeServices } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import type { ShapeConfig } from 'konva/lib/Shape';
	import { KonvaEditor } from '$lib/Modal/PictureElements/konvaEditor';
	import Icon from '@iconify/svelte';
	import { icons } from '$lib/Modal/PictureElements/icons';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';

	export let konva: KonvaEditor;
	export let selectedShape: ShapeConfig;
	export let selectedShapes: ShapeConfig[];
	export let entityOptions;

	let collapsed = true;
	let testState: boolean | undefined = undefined;
	let timeout: ReturnType<typeof setTimeout>;

	$: selectedService =
		selectedShape?.attrs?.onclick?.domain && selectedShape?.attrs?.onclick?.service
			? `${selectedShape.attrs.onclick.domain}.${selectedShape.attrs.onclick.service}`
			: '';

	$: selectedTarget = selectedShape?.attrs?.onclick?.target?.entity_id || '';

	$: serviceData = selectedShape?.attrs?.onclick?.data
		? JSON.stringify(selectedShape.attrs.onclick.data, null, 2)
		: '';

	$: if (!selectedShape || selectedShapes.length !== 1) {
		selectedService = '';
		selectedTarget = '';
		serviceData = '';
	}

	$: serviceOptions = Object.entries($services || {})
		.flatMap(([domain, domainServices]) =>
			Object.keys(domainServices).map((service) => `${domain}.${service}`)
		)
		.sort((a, b) => a.localeCompare(b));

	onMount(async () => {
		if ($connection && !$services) {
			subscribeServices($connection, (data) => {
				$services = data;
			});
		}
	});

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const id = target.id;
		const value = target.value;

		if (id === 'service') {
			selectedService = value;
		} else if (id === 'target') {
			selectedTarget = value;
		} else if (id === 'data') {
			serviceData = value;
		}

		updateServiceCall();
	}

	function updateServiceCall() {
		if (selectedShape) {
			let [domain, service] = selectedService.split('.');

			let data;

			try {
				data = serviceData ? JSON.parse(serviceData) : undefined;
			} catch (err) {
				console.error('Invalid JSON in service data:', err);
			}

			const serviceCall: {
				domain?: string;
				service?: string;
				target?: { entity_id: string };
				data?: any;
			} = {};

			// domain
			if (domain?.trim() !== '') serviceCall.domain = domain.trim();

			// service
			if (service && service.trim() !== '') serviceCall.service = service.trim();

			// target
			if (selectedTarget?.trim() !== '') {
				serviceCall.target = { entity_id: selectedTarget.trim() };
			}

			// data
			if (data && Object.keys(data).length > 0) serviceCall.data = data;

			// remove data if empty
			if (serviceCall.data && Object.keys(serviceCall.data).length === 0) {
				delete serviceCall.data;
			}

			if (Object.keys(serviceCall).length === 0) {
				konva.updateAttr(selectedShape.attrs.id, 'onclick', undefined);
			} else {
				konva.updateAttr(selectedShape.attrs.id, 'onclick', serviceCall);
			}
		}
	}

	async function handleClick() {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			testState = undefined;
		}, 3500);

		if (!selectedService) {
			testState = false;
			console.error('Service not selected');
			return;
		}

		const [domain, service] = selectedService.split('.');

		if (!domain || !service) {
			testState = false;
			console.error('Invalid service format');
			return;
		}

		let target = undefined;
		if (selectedTarget) {
			if ($states && $states?.[selectedTarget]) {
				target = { entity_id: selectedTarget };
			} else {
				testState = false;
				console.error('Invalid target entity:', selectedTarget);
				return;
			}
		}

		let data = undefined;
		if (serviceData.trim()) {
			try {
				data = JSON.parse(serviceData);
			} catch (err) {
				testState = false;
				console.error('Invalid JSON in service data:', err);
				return;
			}
		}

		try {
			await callService($connection, domain, service, data, target);
			testState = true;
			console.debug('Service call test successful');
		} catch (err) {
			testState = false;
			console.error('Error testing service call:', err);
			if (err instanceof Error) {
				console.error('Error message:', err.message);
			}
		}
	}

	$: disabled =
		!selectedShape?.attrs?.draggable ||
		selectedShapes?.length !== 1 ||
		['v-guide', 'h-guide', 'group'].includes(selectedShape?.attrs?.type);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="konva-header"
	on:click={() => {
		collapsed = !collapsed;
	}}
>
	<div class="title">
		<Icon icon={icons['tapAction']} width="20" height="20" />

		<h3>Action</h3>
	</div>

	<div class="right">
		<button title={collapsed ? 'Expand' : 'Collapse'}>
			<Icon icon={icons[collapsed ? 'expand' : 'collapse']} width="20" height="20" />
		</button>

		<button
			title={testState === undefined ? 'Test' : testState ? 'Success' : 'Open Browser Console'}
			{disabled}
			on:click|stopPropagation={handleClick}
		>
			{#if testState === undefined}
				<Icon icon={icons['test']} width="20" height="20" />
			{:else}
				<Icon
					icon={testState ? icons['success'] : icons['fail']}
					width="20"
					height="20"
					color={testState ? '#4CAF50' : '#FFA500'}
				/>
			{/if}
		</button>
	</div>
</div>

{#if !collapsed}
	<div class="items" transition:slide={{ duration: 190, easing: expoOut }}>
		<div class="top"></div>

		<div class="item">
			<label for="service">Service:</label>

			<input
				id="service"
				title="Service (required)"
				type="text"
				list="serviceOptions"
				value={selectedService}
				on:change={handleChange}
				{disabled}
			/>
		</div>

		<div class="item">
			<label for="target">Target:</label>
			<input
				id="target"
				title="Entity ID (optional)"
				type="text"
				list="entityOptions"
				value={selectedTarget}
				on:change={handleChange}
				{disabled}
			/>
		</div>

		<div class="item">
			<label for="data">Data:</label>
			<textarea
				id="data"
				title="JSON (optional)"
				value={serviceData}
				on:change={handleChange}
				{disabled}
				spellcheck="false"
			></textarea>
		</div>
	</div>
{/if}

<datalist id="serviceOptions">
	{#each serviceOptions as service}
		<option value={service}></option>
	{/each}
</datalist>

<datalist id="entityOptions">
	{#each entityOptions as entityId}
		<option value={entityId}></option>
	{/each}
</datalist>

<style>
	.konva-header {
		cursor: pointer;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0 0.8rem 0.95rem 0.8rem;
		overflow-y: scroll;
		overflow-x: hidden;
	}

	.item {
		display: grid;
		gap: 0.15rem;
		grid-template-columns: 3.75rem auto;
		align-items: baseline;
	}

	.item input,
	.item textarea {
		min-width: 7.5rem;
		border: none;
		border-radius: 0.3rem;
		padding: 0.3rem 0.5rem 0.35rem 0.5rem;
		background-color: rgba(0, 0, 0, 0.35);
		color: inherit;
		font-family: inherit;
		font-size: inherit;
	}

	.item textarea {
		resize: vertical;
		min-height: 2rem;
	}

	.item input:disabled,
	.item textarea:disabled {
		opacity: 0.5;
	}
</style>
