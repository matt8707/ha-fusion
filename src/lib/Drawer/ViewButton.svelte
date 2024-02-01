<script lang="ts">
	import { dashboard, lang, ripple, record } from '$lib/Stores';
	import { createEventDispatcher, tick } from 'svelte';
	import Ripple from 'svelte-ripple';
	import Icon from '@iconify/svelte';
	import { generateId } from '$lib/Utils';

	const dispatch = createEventDispatcher();

	/**
	 * Adds a new view to `$dashboard`
	 */
	async function handleClick() {
		// if a view with the default name "Overview" already exists
		// append an increasing number to the name e.g. "Overview 2"
		const placeholder = $lang('overview');
		const id = generateId($dashboard);

		let count = 1;
		let name = placeholder;

		while ($dashboard.views.find((view) => view.name === name)) {
			count += 1;
			name = `${placeholder} ${count}`;
		}

		// prepend view
		$dashboard.views = [
			{
				name: name,
				id,
				sections: []
			},
			...$dashboard.views
		];

		$record();

		// click new view
		await tick();
		const button = document.getElementById(String(id));
		if (button) {
			button.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'start'
			});
			button.click();
		}

		dispatch('clicked');
	}
</script>

<button class="button dropdown" on:click={handleClick} use:Ripple={$ripple}>
	<figure style:width="1.35rem">
		<Icon icon="fluent:tab-add-24-filled" height="none" />
	</figure>

	{$lang('add_view')}
</button>
