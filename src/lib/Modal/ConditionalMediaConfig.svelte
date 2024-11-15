<script lang="ts">
	import {
		states,
		dashboard,
		lang,
		history,
		historyIndex,
		record,
		ripple,
		motion,
		selectedLanguage
	} from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import Select from '$lib/Components/Select.svelte';
	import ConfigButtons from '$lib/Modal/ConfigButtons.svelte';
	import Modal from '$lib/Modal/Index.svelte';
	import { relativeTime, updateObj } from '$lib/Utils';
	import Ripple from 'svelte-ripple';
	import ConditionalMedia from '$lib/Main/ConditionalMedia.svelte';
	import { slide } from 'svelte/transition';
	import InputClear from '$lib/Components/InputClear.svelte';

	export let isOpen: boolean;
	export let sel: any;
	export let demo: string | undefined = undefined;

	if (demo) {
		// replace history entry with demo
		$history.splice($historyIndex, 1);
		set('entity_id', demo);
	}

	const debug = false;

	let timeout = sel?.timeout;

	const minExpire = 0;
	const maxExpire = 86399;
	const defaultExpire = 900;

	// fix empty media_players array
	if (!sel?.media_players) {
		$history.splice($historyIndex, 1);
		set('media_players', [{ entity_id: '' }]);
	}

	function set(key: string, event?: any) {
		sel = updateObj(sel, key, event);
		$dashboard = $dashboard;
	}

	$: options = genOptions($states, '');
	$: mediaPlayerOptions = genOptions($states, 'media_player.');
	$: addMediaPlayer = sel?.media_players?.every((item: { entity_id: string }) => item.entity_id);

	function genOptions(states: any, domain: string) {
		return Object.keys(states)
			?.filter((key) => key.startsWith(domain))
			?.sort()
			?.map((key) => ({ id: key, label: key }));
	}

	// don't repeat selected entities across mutiple select
	function filterMediaPlayerOptions(active: string) {
		return mediaPlayerOptions.filter(
			(option) =>
				!sel.media_players.some(
					(entity: { entity_id: string }) => entity.entity_id === option.id
				) || option.id === active
		);
	}

	function formatPausedDuration(seconds: number) {
		const now = new Date();
		if (seconds > maxExpire) {
			now.setSeconds(now.getSeconds() + maxExpire);
		} else if (seconds > minExpire) {
			now.setSeconds(now.getSeconds() + seconds);
		}
		return relativeTime(now.toISOString(), $selectedLanguage);
	}

	function handleChange(event: any) {
		const input = event?.target?.value;

		if (input === '' && sel?.timeout) {
			timeout = sel?.timeout;
			return;
		}

		let value = Number(input);

		if (!isNaN(value)) {
			if (value < minExpire) {
				value = minExpire;
			} else if (value > maxExpire) {
				value = maxExpire;
			}

			set('timeout', value);
			timeout = value ?? defaultExpire;
		}
	}

	onDestroy(() => {
		// cleanup empty objects
		if (sel?.media_players) {
			sel.media_players = sel.media_players.filter(
				(item: Record<string, never>) => Object.keys(item).length > 0
			);
			set('media_players', sel.media_players);
		}

		$record();
	});
</script>

{#if isOpen}
	<Modal>
		<h1 slot="title">{$lang('conditional')} {$lang('media')?.toLocaleLowerCase()}</h1>

		<h2>{$lang('preview')}</h2>

		<div class="preview">
			<ConditionalMedia {sel} />
		</div>

		{#if options}
			<h2>{$lang('nothing_playing')}</h2>

			<Select
				computeIcons={true}
				defaultIcon="mdi:image"
				value={sel?.entity_id}
				{options}
				placeholder={$lang('entity')}
				on:change={(event) => set('entity_id', event)}
			/>
		{/if}

		<h2>{$lang('playing')}</h2>

		{#if sel?.media_players?.length}
			<div>
				{#each sel.media_players as item, index}
					<div transition:slide={{ duration: $motion }}>
						<Select
							computeIcons={true}
							defaultIcon="mdi:cast"
							placeholder={$lang('media_player')}
							options={filterMediaPlayerOptions(item.entity_id)}
							value={item.entity_id || ''}
							clearable={sel?.media_players?.length > 1}
							on:change={(event) => {
								if (event?.detail) {
									sel.media_players[index] = { entity_id: event?.detail };
								} else {
									sel.media_players.splice(index, 1);
								}
								set('media_players', sel.media_players);
							}}
						/>

						<br />
					</div>
				{/each}

				<button
					class="options action"
					on:click={() => {
						// add empty obj
						set('media_players', [...sel.media_players, {}]);
					}}
					disabled={!addMediaPlayer}
					style:opacity={!addMediaPlayer ? '0.4' : '1'}
					style:cursor={!addMediaPlayer ? 'unset' : 'pointer'}>{$lang('add')}</button
				>
			</div>
		{/if}

		<div class="paused">
			<h2>{$lang('paused')}</h2>
			<span class="time">
				{@html formatPausedDuration(timeout ?? defaultExpire)}
			</span>
		</div>

		<InputClear
			condition={timeout !== undefined}
			on:clear={() => {
				set('timeout');
				timeout = undefined;
			}}
			let:padding
		>
			<input
				min={minExpire}
				max={maxExpire}
				type="number"
				class="input"
				bind:value={timeout}
				placeholder={timeout?.toString() || defaultExpire?.toString()}
				on:change={handleChange}
				autocomplete="off"
				spellcheck="false"
				style:padding
			/>
		</InputClear>

		<h2>{$lang('hide_name')}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.hide_name}
				on:click={() => set('hide_name', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>

			<button
				class:selected={!sel?.hide_name}
				on:click={() => set('hide_name', false)}
				use:Ripple={$ripple}
			>
				{$lang('no')}
			</button>
		</div>

		<h2>{$lang('show_area')?.replace('{area}', $lang('time')?.toLocaleLowerCase())}</h2>

		<div class="button-container">
			<button
				class:selected={sel?.show_timeout}
				on:click={() => set('show_timeout', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>

			<button
				class:selected={!sel?.show_timeout}
				on:click={() => set('show_timeout', false)}
				use:Ripple={$ripple}
			>
				{$lang('no')}
			</button>
		</div>

		<h2>Marquee</h2>

		<div class="button-container">
			<button class:selected={!sel?.marquee} on:click={() => set('marquee')} use:Ripple={$ripple}>
				{$lang('no')}
			</button>

			<button
				class:selected={sel?.marquee}
				on:click={() => set('marquee', true)}
				use:Ripple={$ripple}
			>
				{$lang('yes')}
			</button>
		</div>

		{#if debug}
			<h2>Debug</h2>
			<pre><code>{JSON.stringify(sel, null, 2)}</code></pre>
		{/if}

		<ConfigButtons {sel} />
	</Modal>
{/if}

<style>
	.paused {
		display: flex;
		align-items: first baseline;
		justify-content: space-between;
	}

	.time {
		color: rgba(255, 255, 255, 0.5);
	}

	.input[type='number'] {
		color-scheme: dark;
		margin-right: 2rem;
	}

	.preview {
		width: calc(14.5rem * 2 + 0.4rem);
	}
</style>
