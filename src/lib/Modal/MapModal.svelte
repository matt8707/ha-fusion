<script lang="ts">
	import { states, lang, ripple, configuration } from '$lib/Stores';
	import { onMount, onDestroy } from 'svelte';
	import { Map, NavigationControl, Popup, Marker } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import Ripple from 'svelte-ripple';
	import Modal from '$lib/Modal/Index.svelte';
	import Icon from '@iconify/svelte';
	import { getName } from '$lib/Utils';

	export let isOpen: boolean;
	export let entity_id: string;
	export let entity_picture: string | undefined;

	let entity: HassEntity;
	let map: Map;
	let popup: Popup;
	let mode: 'demo' | 'light' | 'dark';
	let container: HTMLDivElement;
	let geolocate: HTMLDivElement;
	let theme: HTMLDivElement;
	let markerContainer: HTMLDivElement;
	let markerIcon: HTMLButtonElement;
	let controlButtonsIconColor: string;

	const zoom = 13.5;
	const pitch = 0;
	const apiKey = $configuration?.addons?.maptiler?.apikey;

	const styles = {
		demo: 'https://demotiles.maplibre.org/style.json',
		light: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
		dark: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${apiKey}`
	};

	const colors = {
		backgroundColor: {
			light: '#fff',
			dark: '#222222'
		},
		boxShadow: {
			light: '0 0 0 2px rgba(0, 0, 0, 0.1)',
			dark: '0 0 0 2px rgba(255, 255, 255, 0.1)'
		},
		borderTop: {
			light: '1px solid #ddd',
			dark: '1px solid #424242'
		},
		fill: {
			light: '#333',
			dark: '#d2d2d2'
		}
	};

	/** Updates entity if `last_updated` attribute changes */
	$: if ($states?.[entity_id]?.last_updated !== entity?.last_updated) entity = $states?.[entity_id];

	$: coordinates = {
		lon: entity?.attributes?.longitude,
		lat: entity?.attributes?.latitude
	};

	onMount(async () => {
		mode = !apiKey ? 'demo' : localStorage.getItem('darkMap') === 'true' ? 'dark' : 'light';

		const options = {
			container,
			style: styles[mode],
			zoom,
			attributionControl: false,
			antialias: true,
			pitch,
			fadeDuration: 0
		};

		// map
		map = new Map(options);

		// center
		map.setCenter(coordinates);

		map.on('style.load', () => {
			// theme
			themeButtons(mode);

			// marker
			markerIcon.style.backgroundImage = `url("${entity_picture}")`;
			markerContainer.style.display = 'block';
			new Marker({
				element: markerContainer
			})
				.setLngLat([coordinates?.lon, coordinates?.lat])
				.addTo(map);
		});

		// controls
		map.addControl(
			new NavigationControl({
				visualizePitch: true
			}),
			'top-right'
		);

		// geolocate
		map.addControl(
			{
				onAdd: () => {
					geolocate.style.display = 'unset';
					return geolocate;
				},
				onRemove: () => {
					geolocate.remove();
				}
			},
			'top-right'
		);

		// theme
		map.addControl(
			{
				onAdd: () => {
					theme.style.display = 'unset';
					return theme;
				},
				onRemove: () => {
					theme.remove();
				}
			},
			'bottom-right'
		);

		// suppress warnings
		map.on('styleimagemissing', (event) => {
			map.addImage(event.id, {
				width: 0,
				height: 0,
				data: new Uint8Array(0)
			});
		});

		// disable "double-click zoom" on marker
		map.on('dblclick', (event: any) => {
			if (event?.originalEvent?.target?.id === 'marker') {
				event.preventDefault();
			}
		});
	});

	onDestroy(() => {
		map.remove();
	});

	/**
	 * Adjusts the appearance of maplibre buttons based on the given theme mode
	 *
	 * @example
	 * darkModeButtons('dark')
	 * darkModeButtons('light')
	 */
	function themeButtons(mode: string) {
		const theme = (key: 'backgroundColor' | 'boxShadow' | 'borderTop' | 'fill') => {
			return mode === 'dark' ? colors?.[key]?.dark : colors?.[key]?.light;
		};

		for (const element of container.querySelectorAll('.maplibregl-ctrl')) {
			// background-color
			(element as HTMLDivElement).style.backgroundColor = theme('backgroundColor');

			// box-shadow
			(element as HTMLDivElement).style.boxShadow = theme('boxShadow');

			// border-top
			for (const button of element.querySelectorAll('button + button')) {
				(button as HTMLButtonElement).style.borderTop = theme('borderTop');
			}

			// uri encoded background svg fill
			for (const span of element.querySelectorAll('button span')) {
				(span as HTMLSpanElement).style.backgroundImage = window
					.getComputedStyle(span)
					.backgroundImage.replace(
						controlButtonsIconColor || '%23333',
						encodeURIComponent(theme('fill'))
					);
			}
		}
		controlButtonsIconColor = encodeURIComponent(theme('fill'));
	}

	/**
	 * Reverse geolocates the given coordinates
	 * into an address and renders a maplibre popup
	 */
	async function renderPopup() {
		if (!apiKey) return;

		popup = new Popup({
			closeButton: false,
			offset: 32
		}).setLngLat(coordinates);

		const initial = `
        ${getName(undefined, entity)}<br />
        ${$lang(entity?.state)}<br />
    `;

		popup.setHTML(initial).addTo(map);

		try {
			const res = await fetch(
				`https://api.maptiler.com/geocoding/${coordinates.lon},${coordinates.lat}.json?key=${apiKey}`
			);

			const data = await res.json();

			if (data && data.features && data.features[0]) {
				const feature = data.features[0];
				const placeNameKey = Object.keys(feature).find(
					(key) => key !== 'place_name_en' && key.startsWith('place_name_')
				);

				const updated = `${initial}<br />${
					placeNameKey ? feature[placeNameKey] : feature.place_name
				}`;

				if (popup?.isOpen()) {
					popup.setHTML(updated);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}
</script>

{#if isOpen}
	<Modal size="large">
		<h1 slot="title">{getName(undefined, entity)}</h1>

		<!-- container -->
		<div
			bind:this={container}
			class="container"
			style:--popup-background={colors?.backgroundColor?.dark}
		>
			<!-- geolocate -->
			<div bind:this={geolocate} class="maplibregl-ctrl maplibregl-ctrl-group" style:display="none">
				<button
					class="maplibregl-ctrl-geolocate"
					on:click={() => {
						map.easeTo({
							center: coordinates,
							zoom: 17.5,
							pitch: 60,
							bearing: 0
						});
					}}
				>
					<span class="maplibregl-ctrl-icon mapboxgl-ctrl-icon" />
				</button>
			</div>
		</div>

		<!-- theme -->
		<div bind:this={theme} class="maplibregl-ctrl maplibregl-ctrl-group" style:display="none">
			<button
				class="maplibregl-ctrl-geolocate"
				on:click={() => {
					if (mode === 'light') {
						map.setStyle(styles.dark, { diff: false });
						mode = 'dark';
						localStorage.setItem('darkMap', 'true');
					} else {
						map.setStyle(styles.light, { diff: false });
						mode = 'light';
						localStorage.removeItem('darkMap');
					}
				}}
			>
				{#key mode}
					<div
						style:padding={mode === 'dark' ? '0.2rem' : '0.35rem'}
						style:color={mode === 'dark' ? colors.fill.dark : colors.fill.light}
					>
						<Icon
							icon={mode === 'dark' ? 'tabler:sun-filled' : 'tabler:moon-filled'}
							height="none"
						/>
					</div>
				{/key}
			</button>
		</div>

		<!-- marker -->
		<div class="marker-container" bind:this={markerContainer}>
			<div class="pulse" />

			<button
				use:Ripple={{
					...$ripple,
					color: 'rgba(255, 255, 255, 0.5)'
				}}
				id="marker"
				bind:this={markerIcon}
				on:click={() => {
					if (popup?.isOpen()) {
						popup.remove();
					} else {
						setTimeout(() => renderPopup(), 0);
					}
				}}
				on:mouseenter={() => (markerIcon.style.cursor = 'pointer')}
				on:mouseleave={() => (markerIcon.style.cursor = 'unset')}
			/>
		</div>

		<style>
			/* maplibre popup styles */

			.maplibregl-popup-content {
				overflow-wrap: break-word;
				padding: 10px 16px 13px 16px;
				border-radius: 0.8em;
				color: white;
				font-family: inherit;
				font-size: 0.9rem;
				background: var(--popup-background);
			}

			.maplibregl-popup-anchor-top .maplibregl-popup-tip,
			.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,
			.maplibregl-popup-anchor-top-right .maplibregl-popup-tip {
				border-bottom-color: var(--popup-background);
			}

			.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,
			.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,
			.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip {
				border-top-color: var(--popup-background);
			}

			.maplibregl-popup-anchor-left .maplibregl-popup-tip {
				border-right-color: var(--popup-background);
			}

			.maplibregl-popup-anchor-right .maplibregl-popup-tip {
				border-left-color: var(--popup-background);
			}
		</style>
	</Modal>
{/if}

<style>
	.container {
		width: 100%;
		height: 100vh;
		border-radius: 0.6rem;
		font-family: inherit;
		margin-top: 1rem;
	}

	.marker-container {
		position: relative;
		width: 4.5em;
		height: 4.5em;
		display: none;
	}

	#marker {
		position: absolute;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-color: black;
		border: 2px solid white;
		border-radius: 50%;
	}

	.marker-container .pulse {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgb(5, 124, 255);
		border: 2px solid transparent;
		border-radius: 50%;
		animation: pulse 5s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.1);
			opacity: 0;
		}
		30% {
			opacity: 0.5;
		}
		60% {
			transform: scale(1.5);
			opacity: 0;
		}
		100% {
			opacity: 0;
		}
	}
</style>
