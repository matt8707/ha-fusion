<script lang="ts">
	import { connection, editMode } from '$lib/Stores';
	import { onDestroy } from 'svelte';
	import type Hls from 'hls.js';

	/**
	 * https://github.com/video-dev/hls.js/blob/master/docs/API.md
	 *
	 * generic http camera
	 * https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8
	 */

	export let sel: any;
	export let entity: any;
	export let stream_url: string | undefined;
	export let size: string | undefined;
	export let loaderVisible: boolean | undefined;
	export let responsive: boolean | undefined = undefined;
	export let muted: boolean | undefined = true;
	export let controls: boolean | undefined = false;
	export let debug: boolean;
	export let attachVideo: boolean;

	let hls: Hls | undefined;
	let video: HTMLVideoElement;
	let busy: boolean = false;

	$: if (attachVideo) {
		attach();
	} else {
		detach();
	}

	const playVideo = () => video.play();

	async function attach() {
		if (stream_url || busy) return;
		busy = true;

		try {
			// get url
			const response: { url: string } = await $connection?.sendMessagePromise({
				type: 'camera/stream',
				entity_id: entity?.entity_id
			});

			stream_url = response.url;
			if (!stream_url) return;

			// hls
			const { default: Hls } = await import('hls.js');

			if (Hls.isSupported()) {
				const config = {
					backBufferLength: 60,
					fragLoadingTimeOut: 30000,
					manifestLoadingTimeOut: 30000,
					levelLoadingTimeOut: 30000,
					maxLiveSyncPlaybackRate: 2,
					lowLatencyMode: true
				};

				if (!hls) hls = new Hls(config);

				hls.loadSource(stream_url);
				hls.attachMedia(video);

				// events
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					if (debug) console.debug('HLS attached:', sel?.entity_id);
					loaderVisible = false;
					playVideo();
				});

				hls.on(Hls.Events.DESTROYING, () => {
					if (debug) console.debug('HLS detached:', sel?.entity_id);
				});

				hls.on(Hls.Events.ERROR, (_event, data) => {
					if (data.fatal) {
						switch (data.type) {
							case Hls.ErrorTypes.MEDIA_ERROR:
								console.log('fatal media error encountered, try to recover');
								hls?.recoverMediaError();
								break;
							case Hls.ErrorTypes.NETWORK_ERROR:
								console.error('fatal network error encountered', data);
								break;
							default:
								hls?.destroy();
								break;
						}
					}
				});

				// safari native hls
			} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
				video.src = stream_url;
				video.addEventListener('loadedmetadata', playVideo);
			}
		} catch (error: any) {
			if (error?.code === 'start_stream_failed') {
				// entity does not support play stream service
				// fallback to Proxy.svelte (stream_url is undefined)
			} else {
				console.error(error);
			}
		} finally {
			busy = false;
		}
	}

	function detach() {
		hls?.destroy();
		hls = undefined;
		stream_url = undefined;

		// native hls
		if (video) {
			video.removeEventListener('loadedmetadata', playVideo);
			video.src = '';
			video.load();
		}
	}

	onDestroy(() => detach());
</script>

{#if stream_url}
	<video
		bind:this={video}
		{muted}
		{controls}
		style:display={$editMode ? 'none' : 'initial'}
		style:width={responsive ? '100%' : 'calc(14.5rem * 2 + 0.4rem)'}
		style:object-fit={size}
	></video>
{/if}

<style>
	video {
		position: absolute;
		height: 100%;
		z-index: 1;
	}
</style>
