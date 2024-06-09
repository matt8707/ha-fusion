<script lang="ts">
	import { config, connection, editMode } from '$lib/Stores';
	import { onDestroy } from 'svelte';

	/**
	 * * generic camera integration
	 *   - test with url: rtsp://rtsp-test-server.viomic.com:554/stream
	 *   - feed will use hls initially
	 *
	 * * install go2rtc with docker
	 *   - deploy 'alexxit/go2rtc' in host network mode
	 *
	 * * configure RTSPtoWebRTC
	 *   - set go2rtc server URL: http://192.168.1.241:1984
	 *   - use the stun server: stun.l.google.com:19302
	 *   - frontend_stream_type will change from hls to web_rtc
	 */

	export let sel: any;
	export let entity: any;
	export let stream_url: any | undefined;
	export let muted: boolean | undefined = true;
	export let loaderVisible: boolean | undefined;
	export let controls: boolean | undefined = false;
	export let responsive: boolean | undefined = undefined;
	export let size: string | undefined;
	export let debug: boolean;
	export let attachVideo: boolean;

	let video: HTMLVideoElement;
	let busy: boolean = false;

	$: if (attachVideo) {
		attach();
	} else {
		detach();
	}

	async function attach() {
		if (stream_url || busy) return;
		busy = true;

		try {
			// retreive stun server
			const configuration = await getSettings();
			const peerConnection = new RTCPeerConnection(configuration);

			// add transceivers for receiving audio and video
			peerConnection.createDataChannel('dataSendChannel');
			peerConnection.addTransceiver('audio', { direction: 'recvonly' });
			peerConnection.addTransceiver('video', { direction: 'recvonly' });

			// create an offer
			const offer = await peerConnection.createOffer({
				offerToReceiveAudio: true,
				offerToReceiveVideo: true
			});
			await peerConnection.setLocalDescription(offer);

			// handle ice candidates
			let candidates = '';
			const iceResolver = new Promise<void>((resolve) => {
				peerConnection.addEventListener('icecandidate', async (event) => {
					if (!event.candidate) {
						resolve();
						return;
					}
					candidates += `a=${event.candidate.candidate}\r\n`;
				});
			});
			await iceResolver;
			const offer_sdp = offer.sdp! + candidates;

			// send the offer
			let webRtcAnswer: any;
			try {
				const response = await $connection.sendMessagePromise({
					type: 'camera/web_rtc_offer',
					entity_id: entity?.entity_id,
					offer: offer_sdp
				});
				webRtcAnswer = response;
			} catch (err: any) {
				console.error('Failed to start WebRTC stream:', err?.message);
				peerConnection.close();
				return;
			}

			// set up the remote stream
			const remoteStream = new MediaStream();
			peerConnection.addEventListener('track', (event) => {
				remoteStream.addTrack(event.track);
				if (video) video.srcObject = remoteStream;
				if (debug) console.debug('WebRTC attached:', sel?.entity_id);
			});

			// store media stream
			stream_url = remoteStream;

			// set the remote description with the answer
			try {
				await peerConnection.setRemoteDescription(
					new RTCSessionDescription({
						type: 'answer',
						sdp: webRtcAnswer.answer
					})
				);
			} catch (err: any) {
				console.error('Failed to connect WebRTC stream:', err?.message);
				peerConnection.close();
				return;
			}
		} catch (error) {
			console.error(error);
		} finally {
			busy = false;
		}
	}

	async function getSettings() {
		// check component
		if (!$config?.components?.includes('rtsp_to_webrtc')) return {};

		// check stun server
		try {
			const response: any = await $connection.sendMessagePromise({
				type: 'rtsp_to_webrtc/get_settings'
			});

			if (!response && !response?.stun_server) return {};

			// return ice servers
			return {
				iceServers: [{ urls: [`stun:${response.stun_server!}`] }]
			};
		} catch (err) {
			console.error(err);
		}
	}

	function detach() {
		if (!stream_url) return;

		if (video) {
			video.src = '';
			video.load();
		}

		stream_url = undefined;
		if (debug) console.debug('WebRTC detached:', sel?.entity_id);
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
		autoplay={true}
		on:play={() => {
			loaderVisible = false;
		}}
	>
	</video>
{/if}

<style>
	video {
		position: absolute;
		height: 100%;
		z-index: 1;
	}
</style>
