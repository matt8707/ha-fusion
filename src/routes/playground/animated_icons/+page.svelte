<script lang="ts">
	import { states, connection } from '$lib/Stores';
	import { callService } from 'home-assistant-js-websocket';

	import Closet from '$lib/Playground/AnimatedIcons/Closet.svelte';
	import Fan from '$lib/Playground/AnimatedIcons/Fan.svelte';
	import Spot from '$lib/Playground/AnimatedIcons/Spot.svelte';
	import Tv from '$lib/Playground/AnimatedIcons/Tv.svelte';
	import Monitors from '$lib/Playground/AnimatedIcons/Monitors.svelte';
	import Lamp from '$lib/Playground/AnimatedIcons/Lamp.svelte';
	import Climate from '$lib/Playground/AnimatedIcons/Climate.svelte';
	import Bathroom from '$lib/Playground/AnimatedIcons/Bathroom.svelte';
	import Hue from '$lib/Playground/AnimatedIcons/Hue.svelte';
	import Shade from '$lib/Playground/AnimatedIcons/Shade.svelte';
	import Playstation from '$lib/Playground/AnimatedIcons/Playstation.svelte';

	function handleClick(entity_id: string) {
		callService($connection, 'homeassistant', 'toggle', {
			entity_id: entity_id
		});
	}
</script>

{#if !$states}
	Loading...
{:else}
	<div class="grid">
		<div class="grid-item">
			<Fan stateObj={$states?.['switch.gosund_fan_switch']} {handleClick} />
		</div>

		<div class="grid-item">
			<Closet stateObj={$states?.['light.garderob']} {handleClick} />
		</div>

		<div class="grid-item">
			<Spot stateObj={$states?.['light.hall']} {handleClick} />
		</div>

		<div class="grid-item">
			<Tv stateObj={$states?.['media_player.samsung']} {handleClick} />
		</div>

		<div class="grid-item">
			<Monitors stateObj={$states?.['media_player.samsung']} {handleClick} />
		</div>

		<div class="grid-item">
			<Lamp stateObj={$states?.['light.sovrum_group']} {handleClick} />
		</div>

		<div class="grid-item">
			<Climate stateObj={$states?.['climate.ac']} {handleClick} />
		</div>

		<div class="grid-item">
			<Bathroom stateObj={$states?.['light.badrum']} {handleClick} />
		</div>

		<div class="grid-item">
			<Hue stateObj={$states?.['light.studio_dator']} {handleClick} />
		</div>

		<div class="grid-item">
			<Shade stateObj={$states?.['light.vardagsrum_horna']} {handleClick} />
		</div>

		<div class="grid-item">
			<Playstation stateObj={$states?.['light.vardagsrum_horna']} {handleClick} />
		</div>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		grid-gap: 1rem;
	}

	.grid-item {
		background-color: #1f1f1f;
		padding: 1rem;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-flow: column;
		height: 12rem;
	}
</style>
