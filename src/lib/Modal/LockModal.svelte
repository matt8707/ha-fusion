<script lang="ts">
	import { states, connection, lang, ripple, motion } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';
	import Toggle from '$lib/Components/Toggle.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { getName, getSupport } from '$lib/Utils';
	import Ripple from 'svelte-ripple';
	import { onDestroy } from 'svelte';
	import StateLogic from '$lib/Components/StateLogic.svelte';
	import Icon from '@iconify/svelte';

	export let isOpen: boolean;
	export let sel: any;

	let opening = false;
	let code = '';
	let reject = false;
	let pendingAction: 'lock' | 'unlock' | undefined;
	let rejectTimeout: ReturnType<typeof setTimeout> | undefined;
	let openTimeout: ReturnType<typeof setTimeout> | undefined;

	$: entity = $states[sel?.entity_id];
	$: entity_id = entity?.entity_id;
	$: state = entity?.state;
	$: toggle = entity?.state === 'unlocking' || entity?.state === 'unlocked';

	$: attributes = entity?.attributes;
	$: supported_features = attributes?.supported_features;
	$: code_format = attributes?.code_format ?? null;
	$: needsCode = code_format !== null;
	$: showKeypad = needsCode && code_format === 'number';
	$: showTextInput = needsCode && code_format === 'text';

	$: supports = getSupport(supported_features, { OPEN: 1 });

	// clear pending action if state already matches the goal (e.g. unlocked from elsewhere)
	$: if (state && pendingAction) {
		const goal = pendingAction === 'unlock' ? 'unlocked' : 'locked';
		if (state === goal) {
			pendingAction = undefined;
			code = '';
		}
	}

	function handleToggle() {
		if (needsCode) {
			pendingAction = state === 'locked' ? 'unlock' : 'lock';
		} else {
			callService($connection, 'lock', state === 'locked' ? 'unlock' : 'lock', { entity_id });
		}
	}

	async function executeCode() {
		if (!pendingAction) return;
		try {
			const serviceData: Record<string, string> = { entity_id };
			if (code) serviceData.code = code;
			await callService($connection, 'lock', pendingAction, serviceData);
			pendingAction = undefined;
			code = '';
		} catch {
			reject = true;
			rejectTimeout = setTimeout(() => {
				reject = false;
			}, 600);
		}
	}

	function cancelCode() {
		pendingAction = undefined;
		code = '';
	}

	function addDigit(digit: number) {
		code += digit;
	}

	async function handleOpen() {
		clearTimeout(openTimeout);
		await callService($connection, 'lock', 'open', { entity_id });
		opening = true;
		openTimeout = setTimeout(() => {
			opening = false;
		}, 2000);
	}

	onDestroy(() => {
		clearTimeout(rejectTimeout);
		clearTimeout(openTimeout);
	});
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{getName(sel, entity)}</h1>

		<h2>{$lang('state')}</h2>

		<div class="container">
			<StateLogic entity_id={sel?.entity_id} selected={sel} />

			<div class="toggle">
				{#if needsCode}
					<button
						class="done action"
						style:transition="background-color {$motion}ms ease"
						use:Ripple={$ripple}
						on:click={handleToggle}
					>
						{state === 'locked' ? $lang('unlock_action') : $lang('lock_action')}
					</button>
				{:else}
					<Toggle bind:checked={toggle} on:change={handleToggle} />
				{/if}
			</div>
		</div>

		<!-- Code input shown after action is selected -->
		{#if needsCode && pendingAction}
			<div class="code-container">
				{#if showTextInput}
					<input
						type="text"
						class:reject
						bind:value={code}
						placeholder={$lang('code')}
						on:keydown={(e) => e.key === 'Enter' && executeCode()}
					/>
					<div class="confirm-row">
						<button
							use:Ripple={$ripple}
							on:click={() => (code ? (code = '') : cancelCode())}
							style:background-color={code ? '#422522' : ''}
							style:transition="background-color {$motion}ms ease"
						>
							<Icon
								icon="gravity-ui:xmark"
								height="none"
								style="width: 1.65rem; {code ? 'color: #e15241;' : ''}"
							/>
						</button>
						<button use:Ripple={$ripple} on:click={executeCode} style:background-color="#293828">
							<Icon icon="gravity-ui:check" height="none" style="width: 1.8rem; color: #67ad5b;" />
						</button>
					</div>
				{:else if showKeypad}
					<input type="password" class:reject bind:value={code} />
					<div class="buttons">
						{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as digit}
							<button on:click={() => addDigit(digit)} use:Ripple={$ripple}>{digit}</button>
						{/each}

						<button
							on:click={() => (code ? (code = '') : cancelCode())}
							use:Ripple={$ripple}
							style:background-color={code ? '#422522' : ''}
							style:transition="background-color {$motion}ms ease"
						>
							<Icon
								icon="gravity-ui:xmark"
								height="none"
								style="width: 1.65rem; {code ? 'color: #e15241;' : ''}"
							/>
						</button>

						<button on:click={() => addDigit(0)} use:Ripple={$ripple}>0</button>

						<button on:click={executeCode} use:Ripple={$ripple} style:background-color="#293828">
							<Icon icon="gravity-ui:check" height="none" style="width: 1.8rem; color: #67ad5b;" />
						</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Open door button -->
		{#if supports?.OPEN}
			<div class="add-config-button">
				<button
					class="done action"
					class:opening
					style:transition="background-color {$motion}ms ease"
					use:Ripple={$ripple}
					on:click={handleOpen}
				>
					{$lang(opening ? 'open_door_success' : 'open_door')}
				</button>

				<ConfigButtons />
			</div>
		{:else}
			<ConfigButtons />
		{/if}
	</Modal>
{/if}

<style>
	.container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.toggle {
		margin-left: auto;
		height: 25px;
		display: flex;
		align-items: center;
	}

	.opening {
		background-color: #007000 !important;
	}

	.add-config-button {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.add-config-button > button {
		height: fit-content;
		align-self: end;
	}

	/* Code input */
	.code-container {
		display: grid;
	}

	input[type='password'],
	input[type='text'] {
		text-align: center;
		font-size: 3.2rem;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		width: 20rem;
		margin: 2rem auto;
		outline: none;
		border-radius: 0.4rem 0.4rem 0 0;
		background: var(--theme-button-background-color-off);
	}

	input[type='text'] {
		font-size: 1.5rem;
		padding: 0.5rem;
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 2.2rem;
		row-gap: 1.2rem;
		margin: auto;
		margin-bottom: 2.5rem;
	}

	.confirm-row {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.buttons button,
	.confirm-row button {
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
</style>
