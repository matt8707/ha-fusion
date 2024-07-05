<script lang="ts">
	import { states, lang, editMode } from '$lib/Stores';
	import { handleState, handleNumericState, handleAnd, handleOr } from '$lib/Conditional';

	export let item: any;
	export let matches: { [key: string]: boolean };
	export let innerWidth: number;

	const condition = item?.condition;
	const title = `${$lang('state')} (${$lang('current_state')})`;

	function handleTitle(condition: string) {
		return $lang(condition === 'visible' ? 'condition_pass' : 'condition_error');
	}
</script>

<!-- STATE -->
{#if condition === 'state'}
	{@const evalState = handleState($states, item) ? 'visible' : 'hidden'}
	{@const state = item?.entity && $states?.[item?.entity]?.state}

	{#if state}
		<div class="evaluate-condition state" {title}>
			{state}
		</div>
	{/if}

	<div class="evaluate-condition {evalState}" title={handleTitle(evalState)}>
		{$lang(evalState)}
	</div>

	<!-- NUMERIC -->
{:else if condition === 'numeric_state'}
	{@const evalNumeric = handleNumericState($states, item) ? 'visible' : 'hidden'}
	{@const state = item?.entity && $states?.[item?.entity]?.state}

	{#if state}
		<div class="evaluate-condition state" {title}>
			{state}
		</div>
	{/if}

	<div class="evaluate-condition {evalNumeric}" title={handleTitle(evalNumeric)}>
		{$lang(evalNumeric)}
	</div>

	<!-- SCREEN -->
{:else if condition === 'screen'}
	{@const _matches = item.id && matches?.[item.id] ? 'visible' : 'hidden'}

	{#if innerWidth}
		<div class="evaluate-condition state" {title}>
			{innerWidth}px
		</div>
	{/if}

	<div class="evaluate-condition {_matches}" title={handleTitle(_matches)}>
		{$lang(_matches)}
	</div>

	<!-- AND -->
{:else if condition === 'and'}
	{@const evalAnd = handleAnd($editMode, $states, item, item) ? 'visible' : 'hidden'}

	<div class="evaluate-condition {evalAnd}" title={handleTitle(evalAnd)}>
		{$lang(evalAnd)}
	</div>

	<!-- OR -->
{:else if condition === 'or'}
	{@const evalOr = handleOr($editMode, $states, item, item) ? 'visible' : 'hidden'}

	<div class="evaluate-condition {evalOr}" title={handleTitle(evalOr)}>
		{$lang(evalOr)}
	</div>
{/if}

<style>
	.state {
		text-transform: lowercase;
		background-color: rgba(255, 255, 255, 0.2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
