<script lang="ts">
	export let theme: any;
</script>

<div class="container" style:background-image={theme?.global?.['background-image']}>
	<div
		class="drawer"
		style:background-color={theme?.drawer?.color?.['background']}
		style:border-bottom-color={theme?.drawer?.color?.['border']}
		style:border-bottom-width={theme?.drawer?.['border-width']}
		style:border-bottom-style={theme?.drawer?.['border-style']}
	>
		<span
			style:font-size={theme?.drawer?.['font-size']}
			style:color={theme?.drawer?.color?.['text']}
		>
			ffff
		</span>
	</div>
	<div
		class="sidebar"
		style:background-color={theme?.sidebar?.color?.['background']}
		style:border-right-color={theme?.sidebar?.color?.['border']}
		style:border-right-width={theme?.sidebar?.['border-width']}
		style:border-right-style={theme?.sidebar?.['border-style']}
		style:padding={theme?.sidebar?.['padding']}
	>
		<span
			style:font-size={theme?.sidebar?.['font-size']}
			style:color={theme?.sidebar?.color?.['text']}
		>
			ffff
		</span>

		<hr
			style:color={theme?.sidebar?.color?.['divider']}
			style:padding="0"
			style:margin="0"
			style:border="0"
			style:height="0"
			style:border-top="1px solid rgba(0, 0, 0, 0.1)"
			style:border-bottom-width={theme?.sidebar?.['divider-border-width']}
			style:border-bottom-color={theme?.sidebar?.color?.['divider-border']}
			style:border-bottom-style={theme?.sidebar?.['divider-border-style']}
		/>
	</div>
	<div class="main"></div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 0.4fr 1.6fr;
		grid-template-rows: 0.4fr 1.6fr;
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'drawer drawer'
			'sidebar main';

		height: 350px;
		border-radius: 0.6rem;
		overflow: hidden;
		background-size: cover;
		background-repeat: no-repeat;
	}

	.drawer {
		grid-area: drawer;
	}

	.sidebar {
		grid-area: sidebar;
	}

	.main {
		grid-area: main;
	}
</style>
