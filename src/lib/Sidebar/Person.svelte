<script lang="ts">
	import { states, editMode, motion, selectedLanguage, lang } from '$lib/Stores';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { isTimestamp, relativeTime } from '$lib/Utils';
	import { openModal, closeModal } from 'svelte-modals';
	import Icon from '@iconify/svelte';
	import { codePointAt } from '@codemirror/state';

	export let entity_id: string | undefined = undefined;
	export let entity_id_2: string | undefined = undefined;
	export let battery_level_sensor: string | undefined = undefined;
	export let battery_level_sensor_2: string | undefined = undefined;

	let battery_level_sensor_icon: string | undefined;
	let battery_level_sensor_icon_2: string | undefined;
	let battery_level: string | undefined;
	let battery_level_2: string | undefined;
	let entity: HassEntity;
	let entity_2: HassEntity;
	let status_color = '#0000FF';
	let status_color_2 = '#0000FF';
	let icon_color = 'white';
	let icon_color_2 = 'white';
//	let icon_animation = "Icon 1s linear infinite";

	$: if (entity?.state == 'home') {
			status_color = "green"
		} else {
			status_color = "red"
		}

	$: if (entity_2?.state == 'home') {
			status_color_2 = "green"
		} else {
			status_color_2 = "red"
		}		

	$: if ($states?.[battery_level_sensor]?.state <= 15) {
			icon_color = "red"
		} else { 
			icon_color = "white"
		}

	$: if ($states?.[battery_level_sensor_2]?.state <= 15) {
			icon_color_2 = "red"
		} else { 
			icon_color_2 = "white"
		}		

	$: if (entity_id && $states?.[entity_id]?.last_updated !== entity?.last_updated) {
		entity = $states?.[entity_id];
	}

	$: if (entity_id_2 && $states?.[entity_id_2]?.last_updated !== entity_2?.last_updated) {
		entity_2 = $states?.[entity_id_2];
	}

	$: state = entity?.state;
	$: if (battery_level_sensor) {
		battery_level = $states?.[battery_level_sensor]?.state + $states?.[battery_level_sensor]?.attributes.unit_of_measurement;
		battery_level_sensor_icon = $states?.[battery_level_sensor]?.attributes.icon;
	}

	$: state_2 = entity_2?.state;
	$: if (battery_level_sensor_2) {
		battery_level_2 = $states?.[battery_level_sensor_2]?.state + $states?.[battery_level_sensor_2]?.attributes.unit_of_measurement;
		battery_level_sensor_icon_2 = $states?.[battery_level_sensor_2]?.attributes.icon;
	}	


</script>

<div 
  	class="container"
  	class:visible={!entity || state || $editMode}
  	style:transition="{$motion}ms ease, padding {$motion}ms ease"
  	>
	<div class="Person1">
		<div class="State">
				<!-- state -->
		    {#if state}
				{#if state == 'home'}
					{$lang('home')}			
				{:else}
					{$lang('not_home')}
				{/if}
				<!-- hide -->
			{:else if entity && !state}
				<span>{entity_id}</span>
					<!-- !entity_id -->
			{:else if !entity_id && !state}
				<span>{$lang('person')}</span>
			{:else}
				{$lang('unknown')}
			{/if}    
		</div>
	 	<div class="Image">
			<img src={entity?.attributes.entity_picture} alt="entity_picture" style="box-shadow: 0 0 20px {status_color}">				
	 	</div>
		
		<div class="Battery">  
	 		<div class="Icon">	
				<Icon icon={battery_level_sensor_icon} height="18" color={icon_color}/>
	 		</div>  
	 		<div class="Level">
				{battery_level}
	 		</div>
		</div>	
	</div> 
  
	<!-- PERSON 2  -->

  	<div class="Person2">
  		<div class="State">
		<!-- state -->
			{#if state_2}
				{#if state_2 == 'home'}
					{$lang('home')}			
				{:else}
					{$lang('not_home')}
				{/if}
				<!-- hide -->
			{:else if entity_2 && !state_2}
				<span>{entity_id_2}</span>

				<!-- !entity_id -->
			{:else if !entity_id_2 && !state_2}
				<span>{$lang('person')}</span>
			{:else}
				{$lang('unknown')}
			{/if}    
		</div>  

		<div class="Image">
			<img src={entity_2?.attributes.entity_picture} alt="entity_picture" style="box-shadow: 0 0 20px {status_color_2}">
		</div>		 
		<div class=Battery>
  			<div class="Icon">
				<Icon icon={battery_level_sensor_icon_2} height="18" color={icon_color_2}/>
			</div>	
	  		<div class="Level">
				{battery_level_2}
	  		</div>
		</div>	
	</div>
</div>

<style>	

.container { 
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 0px 0px;
  grid-template-areas:
    "Person1 Person2";
}

.Person1 {  	
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto; 
  gap: 0px 0px;
  grid-auto-flow: row;
  grid-template-areas:
    "Image"
    "State"
    "Battery";
  grid-area: Person1;
  padding: var(--theme-sidebar-item-padding);
	}


.Person2 {  
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto; 
  gap: 0px 0px;
  grid-auto-flow: row;
  grid-template-areas:
    "Image"
    "State"
    "Battery";
  grid-area: Person2;
  padding: var(--theme-sidebar-item-padding);  
	}

.Image { 
	grid-area: Image; 
	justify-self: center; 	
	}

.State { 
	grid-area: State; 
	justify-self: center; 
	text-size-adjust: 18px;	
	}

.Battery {  
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 1fr;
  gap: 0px 0px;
  grid-auto-flow: row;
  grid-template-areas:
    "Icon Level";
  grid-area: Battery;

	}

.Icon { 
	grid-area: Icon; 
	justify-self: end; 
}

.Level { 
	grid-area: Level; 
	justify-self: begin; 		
}
	
img {
width: 70px;
height: 70px;
object-fit: cover;
border-radius: 200%;
}


</style>  
