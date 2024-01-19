<script lang="ts">
	import { states, lang, ripple, connection, motion } from '$lib/Stores';
	import Modal from '$lib/Modal/Index.svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import { getName } from '$lib/Utils';
	import Icon from '@iconify/svelte';
	import Ripple from 'svelte-ripple';
	import { callService } from 'home-assistant-js-websocket';
	import { onDestroy } from 'svelte';
	import Select from '$lib/Components/Select.svelte';

	export let isOpen: boolean;
	export let sel: any;

	$: entity = $states[sel?.entity_id];
	$: entity_id = entity?.entity_id;
	$: state = entity?.state;

	let code = '';
	let reject: boolean;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let selectedService: string | undefined;
	let unsubscribe: () => void;

	function addCode(key: number) {
		code += key;
	}

	function clearCode() {
		code = '';
	}

	async function enterCode() {
		if (!code) return;

		try {
			const service = selectedService || 'alarm_disarm';
			await callService($connection, 'alarm_control_panel', service, {
				entity_id,
				code
			});

			selectedService = undefined;
			clearCode();

			// invalid code
		} catch (error: any) {
			if (error.message === 'Invalid alarm code provided') {
				reject = true;
			}

			timeout = setTimeout(() => {
				reject = false;
			}, 600);
		}
	}

	onDestroy(() => {
		unsubscribe?.();
		clearTimeout(timeout);
	});

	const options = [
		{
			id: 'alarm_arm_home',
			icon: 'mdi:house',
			label: $lang('alarm_modes_armed_home')
		},
		{
			id: 'alarm_arm_away',
			icon: 'mdi:lock',
			label: $lang('alarm_modes_armed_away')
		},
		{
			id: 'alarm_arm_night',
			icon: 'mdi:moon-waning-crescent',
			label: $lang('alarm_modes_armed_night')
		},
		{
			id: 'alarm_arm_vacation',
			icon: 'mdi:airplane',
			label: $lang('alarm_modes_armed_vacation')
		},
		{
			id: 'alarm_arm_custom_bypass',
			icon: 'mdi:shield',
			label: $lang('alarm_modes_armed_custom_bypass')
		},
		{
			id: 'alarm_disarm',
			icon: 'mdi:shield-off',
			label: $lang('alarm_modes_disarmed')
		}
	];
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('state')}</h2>

		<span class:arming={state === 'arming'}>
			<StateLogic entity_id={sel?.entity_id} selected={sel} />
		</span>

		{#if state === 'disarmed'}
			<h2>{$lang('alarm_modes_label')}</h2>

			<Select
				customItems={true}
				{options}
				placeholder={$lang('alarm_modes_label')}
				value={'alarm_disarm'}
				on:change={(event) => {
					selectedService = event.detail;
				}}
			/>
		{/if}

		<input type="password" class:reject bind:value={code} />

		<div>
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as digit}
				<button on:click={() => addCode(digit)} use:Ripple={$ripple}>
					{digit}
				</button>
			{/each}

			<button
				on:click={clearCode}
				use:Ripple={$ripple}
				style:background-color={code === '' ? '' : '#422522'}
				style:transition="background-color {$motion}ms ease"
			>
				<Icon
					icon="gravity-ui:xmark"
					height="none"
					style={`width: 1.65rem; ${
						code === '' ? '' : `color: #e15241; transition: background-color ${$motion}ms ease;`
					}`}
				></Icon>
			</button>

			<button on:click={() => addCode(0)} use:Ripple={$ripple}>0</button>

			<button on:click={enterCode} use:Ripple={$ripple} style:background-color="#293828">
				<Icon icon="gravity-ui:check" height="none" style="width: 1.8rem; color: #67ad5b;"></Icon>
			</button>
		</div>
	</Modal>
{/if}

<style>
	input[type='password'] {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 3rem;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		width: 100%;
		margin-top: 1.5rem;
		outline: none;
		border-radius: 0.5rem 0.5rem 0 0;
		background: var(--theme-button-background-color-off);
	}

	div {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(4, 1fr);
		grid-column-gap: 0rem;
		grid-row-gap: 1rem;
		padding: 10rem, 20rem, 30rem, 40rem;
	}

	button {
		place-self: center;
		cursor: pointer;
		user-select: none;
		background-color: var(--theme-button-background-color-off);
		border-radius: 50%;
		width: 4.5rem;
		height: 4.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5rem;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.reject {
		animation: shake 500ms linear;
	}

	@keyframes shake {
		8%,
		41% {
			transform: translateX(-10px);
		}
		25%,
		58% {
			transform: translateX(10px);
		}
		75% {
			transform: translateX(-5px);
		}
		92% {
			transform: translateX(5px);
		}
		0%,
		100% {
			transform: translateX(0);
		}
	}

	.arming {
		animation: blink 800ms linear infinite;
	}

	@keyframes blink {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
