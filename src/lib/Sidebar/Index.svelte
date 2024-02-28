<script lang="ts">
	// store
	import { dashboard, motion, showDrawer, editMode, record, dragging } from '$lib/Stores';
	import { onMount, tick } from 'svelte';
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
	import { openModal } from 'svelte-modals';
	import { getSelected } from '$lib/Utils';
	import type { SidebarItem } from '$lib/Types';
	import '$lib/Sidebar/Sidebar.css';

	let imported: (string | undefined)[] = [];
	let loaded = false;

	let Bar: typeof import('$lib/Sidebar/Bar.svelte');
	let Camera: typeof import('$lib/Sidebar/Camera.svelte');
	let Configure: typeof import('$lib/Sidebar/Configure.svelte');
	let Date: typeof import('$lib/Sidebar/Date.svelte');
	let DateTime: typeof import('$lib/Sidebar/DateTime.svelte');	
	let Divider: typeof import('$lib/Sidebar/Divider.svelte');
	let Graph: typeof import('$lib/Sidebar/Graph.svelte');
	let History: typeof import('$lib/Sidebar/History.svelte');
	let Iframe: typeof import('$lib/Sidebar/Iframe.svelte');
	let Image: typeof import('$lib/Sidebar/Image.svelte');
	let Navigate: typeof import('$lib/Sidebar/Navigate.svelte');
	let Notifications: typeof import('$lib/Sidebar/Notifications.svelte');
	let Person: typeof import('$lib/Sidebar/Person.svelte');	
	let Radial: typeof import('$lib/Sidebar/Radial.svelte');
	let Sensor: typeof import('$lib/Sidebar/Sensor.svelte');
	let Template: typeof import('$lib/Sidebar/Template.svelte');
	let Time: typeof import('$lib/Sidebar/Time.svelte');
	let Timer: typeof import('$lib/Sidebar/Timer.svelte');
	let Weather: typeof import('$lib/Sidebar/Weather.svelte');
	let WeatherForecast: typeof import('$lib/Sidebar/WeatherForecast.svelte');

	const importsMap = {
		bar: () => import('$lib/Sidebar/Bar.svelte').then((module) => (Bar = module)),
		camera: () => import('$lib/Sidebar/Camera.svelte').then((module) => (Camera = module)),
		configure: () => import('$lib/Sidebar/Configure.svelte').then((module) => (Configure = module)),
		date: () => import('$lib/Sidebar/Date.svelte').then((module) => (Date = module)),
		datetime: () => import('$lib/Sidebar/DateTime.svelte').then((module) => (DateTime = module)),
		divider: () => import('$lib/Sidebar/Divider.svelte').then((module) => (Divider = module)),
		graph: () => import('$lib/Sidebar/Graph.svelte').then((module) => (Graph = module)),
		history: () => import('$lib/Sidebar/History.svelte').then((module) => (History = module)),
		iframe: () => import('$lib/Sidebar/Iframe.svelte').then((module) => (Iframe = module)),
		image: () => import('$lib/Sidebar/Image.svelte').then((module) => (Image = module)),
		navigate: () => import('$lib/Sidebar/Navigate.svelte').then((module) => (Navigate = module)),
		notifications: () =>
			import('$lib/Sidebar/Notifications.svelte').then((module) => (Notifications = module)),
		person: () => import('$lib/Sidebar/Person.svelte').then((module) => (Person = module)),			
		radial: () => import('$lib/Sidebar/Radial.svelte').then((module) => (Radial = module)),
		sensor: () => import('$lib/Sidebar/Sensor.svelte').then((module) => (Sensor = module)),
		template: () => import('$lib/Sidebar/Template.svelte').then((module) => (Template = module)),
		time: () => import('$lib/Sidebar/Time.svelte').then((module) => (Time = module)),
		timer: () => import('$lib/Sidebar/Timer.svelte').then((module) => (Timer = module)),
		weather: () => import('$lib/Sidebar/Weather.svelte').then((module) => (Weather = module)),
		weather_forecast: () =>
			import('$lib/Sidebar/WeatherForecast.svelte').then((module) => (WeatherForecast = module))
	};

	$: if ($dashboard?.sidebar) importComponents();

	/**
	 * Dynamically imports sidebar components based on
	 * the types present in the `$dashboard.sidebar`.
	 */
	async function importComponents() {
		const types = [...new Set($dashboard.sidebar.map((item) => item.type))];
		const promises = [];

		// counter for supported and not yet imported imports
		let validImportsCount = 0;

		for (let type of types) {
			const module = importsMap[type as keyof typeof importsMap];
			if (!imported.includes(type) && module) {
				promises.push(module());
				imported.push(type);
				validImportsCount++;
			}
		}

		await Promise.all(promises);

		/**
		 * Wait for all imports to complete then set `loaded` flag
		 * to prevent flip animation before components has loaded.
		 */
		if (imported.length >= validImportsCount) {
			loaded = true;
		}
	}

	/**
	 * Dynamically imports modals
	 */
	async function handleClick(selectedId: number | undefined) {
		const sel = getSelected(selectedId, $dashboard) as SidebarItem;

		if ($editMode && sel) {
			if (sel?.type === 'bar') {
				openModal(() => import('$lib/Modal/BarConfig.svelte'), { sel });
			} else if (sel?.type === 'camera') {
				openModal(() => import('$lib/Modal/CameraConfig.svelte'), { sel });
			} else if (sel?.type === 'date') {
				openModal(() => import('$lib/Modal/DateConfig.svelte'), { sel });
			} else if (sel?.type === 'datetime') {
				openModal(() => import('$lib/Modal/DateTimeConfig.svelte'), { sel });								
			} else if (sel?.type === 'divider') {
				openModal(() => import('$lib/Modal/DividerConfig.svelte'), { sel });
			} else if (sel?.type === 'graph') {
				openModal(() => import('$lib/Modal/GraphConfig.svelte'), { sel });
			} else if (sel?.type === 'history') {
				openModal(() => import('$lib/Modal/HistoryConfig.svelte'), { sel });
			} else if (sel?.type === 'iframe') {
				openModal(() => import('$lib/Modal/IframeConfig.svelte'), { sel });
			} else if (sel?.type === 'image') {
				openModal(() => import('$lib/Modal/ImageConfig.svelte'), { sel });
			} else if (sel?.type === 'navigate') {
				openModal(() => import('$lib/Modal/NavigateConfig.svelte'), { sel });
			} else if (sel?.type === 'notifications') {
				openModal(() => import('$lib/Modal/NotificationsConfig.svelte'), { sel });
			} else if (sel?.type === 'person') {
				openModal(() => import('$lib/Modal/PersonConfig.svelte'), { sel });					
			} else if (sel?.type === 'radial') {
				openModal(() => import('$lib/Modal/RadialConfig.svelte'), { sel });
			} else if (sel?.type === 'sensor') {
				openModal(() => import('$lib/Modal/SensorConfig.svelte'), { sel });
			} else if (sel?.type === 'template') {
				openModal(() => import('$lib/Modal/TemplateConfig.svelte'), { sel });
			} else if (sel?.type === 'time') {
				openModal(() => import('$lib/Modal/TimeConfig.svelte'), { sel });
			} else if (sel?.type === 'timer') {
				openModal(() => import('$lib/Modal/TimerConfig.svelte'), { sel });
			} else if (sel?.type === 'weather') {
				openModal(() => import('$lib/Modal/WeatherConfig.svelte'), { sel });
			} else if (sel?.type === 'weather_forecast') {
				openModal(() => import('$lib/Modal/WeatherForecastConfig.svelte'), { sel });
			} else {
				openModal(() => import('$lib/Modal/SidebarItemConfig.svelte'), { sel });

				await tick();
				setTimeout(() => {
					$editMode = true;
					$showDrawer = true;
				}, $motion);
			}
		} else {
			if (sel?.type === 'camera') {
				openModal(() => import('$lib/Modal/CameraModal.svelte'), { sel });
			} else if (sel?.type === 'timer') {
				openModal(() => import('$lib/Modal/TimerModal.svelte'), { sel });
			}
		}
	}

	function handleSort(event: CustomEvent<DndEvent>) {
		$dragging = true;
		$dashboard.sidebar = event.detail.items;
		if (event?.type === 'finalize') {
			$record();
			$dragging = false;
		}
	}

	// media query js
	let matches = false;

	onMount(() => {
		const handleMediaQueryChange = (event: { matches: boolean }) => {
			matches = event.matches;
		};

		const mediaQuery = window.matchMedia('(max-width: 768px)');
		matches = mediaQuery.matches;

		mediaQuery.addEventListener('change', handleMediaQueryChange);
		// cleanup
		return () => {
			mediaQuery.removeEventListener('change', handleMediaQueryChange);
		};
	});
</script>

<aside
	style:padding={$dashboard.hide_sidebar || $dashboard.sidebar.length === 0
		? '0px'
		: 'var(--theme-sidebar-padding)'}
	style:transition="padding {$motion}ms ease"
>
	{#if $editMode}
		{#await import('$lib/Components/ResizeHandle.svelte') then ResizeHandle}
			<svelte:component this={ResizeHandle.default} />
		{/await}
	{/if}

	{#if !$dashboard?.hide_sidebar}
		<section
			use:dndzone={{
				type: 'sidebar',
				items: $dashboard.sidebar,
				flipDurationMs: $motion,
				dragDisabled: !$editMode,
				dropTargetStyle: {},
				zoneTabIndex: -1,
				morphDisabled: true
			}}
			on:consider={handleSort}
			on:finalize={handleSort}
		>
			{#each $dashboard.sidebar as item (item.id)}
				{@const hide_mobile = matches && item?.hide_mobile && !$editMode}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					id={String(item.id)}
					animate:flip={{ duration: loaded ? $motion : 0 }}
					class="sidebar_edit_mode"
					style:display={item?.type === 'divider' ||
					item?.type === 'date' ||
					item?.type === 'camera' ||
					item?.type === 'time' ||
					item?.type === 'notifications' ||
					item?.type === 'configure'
						? 'flex'
						: 'initial'}
				>
					<!-- BAR -->
					{#if Bar && item?.type === 'bar' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Bar.default}
								entity_id={item?.entity_id}
								name={item?.name}
								math={item?.math}
								id={item?.id}
							/>
						</button>

						<!-- CAMERA -->
					{:else if Camera && item?.type === 'camera' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Camera.default} sel={item} />
						</button>

						<!-- CONFIGURE -->
					{:else if Configure && item?.type === 'configure'}
						<div role="button" tabindex="0" on:click={() => handleClick(item?.id)}>
							<svelte:component this={Configure.default} sel={item} />
						</div>

						<!-- DATE -->
					{:else if Date && item?.type === 'date' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Date.default}
								short_day={item?.short_day}
								short_month={item?.short_month}
								hide={item?.hide}
								layout={item?.layout}
							/>
						</button>

						<!-- DATE & TIME -->
					{:else if DateTime && item?.type === 'datetime'}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={DateTime.default} seconds={item?.seconds} hour12={item?.hour12} year={item?.year}/>		
						</button>						

						<!-- DIVIDER -->
					{:else if Divider && item?.type === 'divider' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)} aria-label={item?.type} tabindex="-1">
							<svelte:component this={Divider.default} mode={item?.mode} size={item?.size} />
						</button>

						<!-- GRAPH -->
					{:else if Graph && item?.type === 'graph' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Graph.default}
								entity_id={item?.entity_id}
								name={item?.name}
								period={item?.period}
								stroke={item?.stroke}
							/>
						</button>

						<!-- HISTORY -->
					{:else if History && item?.type === 'history' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={History.default}
								entity_id={item?.entity_id || ''}
								period={item?.period}
							/>
						</button>

						<!-- IFRAME -->
					{:else if Iframe && item?.type === 'iframe' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Iframe.default} url={item?.url} size={item?.size} />
						</button>

						<!-- NOTIFICATIONS -->
					{:else if Notifications && item?.type === 'notifications' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Notifications.default} sel={item} />
						</button>

						<!-- IMAGE -->
					{:else if Image && item?.type === 'image' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Image.default} entity_id={item?.entity_id} url={item?.url} />
						</button>

						<!-- NAVIGATE -->
					{:else if Navigate && item?.type === 'navigate' && !hide_mobile}
						{#key $editMode}
							<div
								on:click|preventDefault={() => {
									if ($editMode) handleClick(item?.id);
								}}
							>
								<svelte:component this={Navigate.default} />
							</div>
						{/key}

						<!-- PERSON -->
					{:else if Person && item?.type === 'person'}
						<div on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Person.default}
								entity_id={item?.entity_id}
								battery_level_sensor={item?.battery_level_sensor}
								entity_id_2={item?.entity_id_2}
								battery_level_sensor_2={item?.battery_level_sensor_2}								
							/>
						</div>
						
						<!-- RADIAL -->
					{:else if Radial && item?.type === 'radial' && !hide_mobile}
						<div on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Radial.default}
								entity_id={item?.entity_id}
								name={item?.name}
								strokeWidth={item?.stroke}
							/>
						</div>

						<!-- SENSOR -->
					{:else if Sensor && item?.type === 'sensor' && !hide_mobile}
						<div on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Sensor.default}
								entity_id={item?.entity_id}
								prefix={item?.prefix}
								suffix={item?.suffix}
								date={item?.date || false}
							/>
						</div>

						<!-- TEMPLATE -->
					{:else if Template && item?.type === 'template' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Template.default} sel={item} />
						</button>

						<!-- TIME -->
					{:else if Time && item?.type === 'time' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component
								this={Time.default}
								seconds={item?.seconds}
								hour12={item?.hour12 || false}
							/>
						</button>

						<!-- TIMER -->
					{:else if Timer && item?.type === 'timer' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Timer.default} sel={item} />
						</button>

						<!-- WEATHER -->
					{:else if Weather && item?.type === 'weather' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={Weather.default} sel={item} />
						</button>

						<!-- WEATHER FORECAST -->
					{:else if WeatherForecast && item?.type === 'weather_forecast' && !hide_mobile}
						<button on:click={() => handleClick(item?.id)}>
							<svelte:component this={WeatherForecast.default} sel={item} />
						</button>
					{/if}
				</div>
			{/each}
		</section>

		{#await import('$lib/Sidebar/Toast.svelte') then Toast}
			<svelte:component this={Toast.default} />
		{/await}
	{/if}
</aside>

<style>
	aside {
		position: relative;
		grid-area: aside;
		padding: var(--theme-sidebar-padding);
		padding-bottom: 1.4rem !important;
		background-color: var(--theme-colors-sidebar-background);
		border-right: var(--theme-colors-sidebar-border);
	}

	div {
		width: 100%;
	}

	button {
		background: inherit;
		border: inherit;
		color: inherit;
		font-family: inherit;
		padding: inherit;
		text-align: inherit;
		cursor: inherit;
		font-size: inherit;
		width: 100%;
	}

	section {
		margin-top: 1rem;
		height: calc(100% - 1rem);
		font-size: var(--theme-sidebar-font-size);
		display: flex;
		flex-direction: column;
	}

	.sidebar_edit_mode {
		transition: height 200ms ease;
		display: flex;
	}
</style>
