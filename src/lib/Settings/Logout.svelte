<script lang="ts">
	import { openModal, closeModal } from 'svelte-modals';
	import Ripple from 'svelte-ripple';
	import { lang, ripple } from '$lib/Stores';

	function handleClick() {
		openModal(() => import('$lib/Modal/ConfirmAlert.svelte'), {
			title: $lang('log_out'),
			message: $lang('confirm_log_out'),
			confirm: async () => {
				localStorage.removeItem('hassTokens');
				location.reload();
			},
			cancel: () => {
				closeModal();
			}
		});
	}
</script>

<div>
	<span>
		<h2>{$lang('log_out')}</h2>
		<p>{$lang('auth')}</p>
	</span>

	<button
		class="action remove"
		on:click|preventDefault={handleClick}
		use:Ripple={{
			...$ripple,
			color: 'rgba(0, 0, 0, 0.35)'
		}}
	>
		{$lang('remove')}
	</button>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 10px;
		align-items: center;
	}

	p {
		margin-block-end: 0.6rem;
		font-size: 0.9rem;
		opacity: 0.75;
	}

	p:hover {
		cursor: default;
	}

	button {
		font-size: 1rem;
		margin-top: 1.3rem;
	}
</style>
