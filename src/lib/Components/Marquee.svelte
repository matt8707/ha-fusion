<script lang="ts">
	export let duration = 15;
	export let repeat = 2;
	export let paused = false;
	export let pauseOnHover = false;

	let hovered = false;

	function handleHover(event: MouseEvent | FocusEvent) {
		if (event?.type === 'mouseover' || event?.type === 'focus') {
			hovered = true;
		} else if (event?.type === 'mouseout' || event?.type === 'blur') {
			hovered = false;
		}
	}
</script>

<div
	role="none"
	on:pointerover={handleHover}
	on:pointerout={handleHover}
	on:focus={handleHover}
	on:blur={handleHover}
>
	<div class="content" class:paused={paused || (pauseOnHover && hovered)}>
		{#each Array(repeat) as i}
			<div class="text" style:animation-duration="{duration}s" title={i}>
				<slot />
			</div>
		{/each}
	</div>
</div>

<style>
	.content {
		width: 100000px;
	}

	.text {
		animation-name: animation;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		float: left;
	}

	.paused .text {
		animation-play-state: paused;
	}

	@keyframes animation {
		100% {
			transform: translateX(-100%);
		}
	}
</style>
