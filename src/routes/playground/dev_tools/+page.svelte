<script lang="ts">
	import { states } from '$lib/Stores';

	let search = '';
	let selected = '';

	$: entities = $states
		? Object.values($states).sort((a, b) => a.entity_id.localeCompare(b.entity_id))
		: [];

	$: filtered = entities.filter((entity) => !search || entity.entity_id.includes(search));

	function domainList(entityArray: any[]) {
		return entityArray.reduce<any>((acc, entity) => {
			const domain = entity.entity_id.split('.')[0];
			if (!acc[domain]) acc[domain] = [];
			acc[domain].push(entity);
			return acc;
		}, {});
	}

	$: domains = domainList(entities);
	$: filteredDomains = domainList(filtered);
	$: displayed = selected
		? filtered.filter((entity) => entity.entity_id.startsWith(selected))
		: filtered;
	$: count = selected ? (domains[selected] ? domains[selected].length : 0) : entities.length;

	function display(value: any): string {
		if (Array.isArray(value)) return value.map(display).join('<br>- ');
		if (typeof value === 'object' && value !== null)
			return Object.entries(value)
				.map(([k, v]) => `${k}: ${display(v)}`)
				.join('<br>');
		return String(value);
	}
</script>

<input bind:value={search} placeholder="Entity ID..." />

{#if $states}
	<div>
		<button class:selected={selected !== ''} on:click={() => (selected = '')}>all</button>
		{#each Object.keys(domains) as domain (domain)}
			{#if filteredDomains[domain]}
				<button class:selected={selected !== domain} on:click={() => (selected = domain)}
					>{domain}</button
				>
			{/if}
		{/each}

		<span>{displayed.length} / {count}</span>
	</div>

	<br />

	<table>
		<thead>
			<tr>
				<th>Entity</th>
				<th>State</th>
				<th>Attributes</th>
			</tr>
		</thead>
		<tbody>
			{#each displayed as entity}
				<tr>
					<td>{entity.entity_id}</td>
					<td>{entity.state}</td>
					<td>
						{#each Object.entries(entity.attributes) as [key, value]}
							<div>
								<strong>{key}:</strong>
								{@html display(value)}
							</div>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.selected {
		opacity: 0.5;
	}

	input {
		width: 100%;
		padding: 8px 12px;
		margin-bottom: 16px;
		box-sizing: border-box;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		user-select: text;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 8px 12px;
		word-wrap: break-word;
		vertical-align: top;
		background-color: #2d2d2d;
		font-size: 0.85rem;
	}

	th {
		background-color: #1f1f1f;
	}

	td:nth-child(1),
	th:nth-child(1) {
		width: 20%;
	}
	td:nth-child(2),
	th:nth-child(2) {
		width: 20%;
	}
	td:nth-child(3),
	th:nth-child(3) {
		width: 60%;
	}

	button {
		margin: 0 0.5rem 0.5rem 0;
		cursor: pointer;
	}

	span {
		opacity: 0.5;
	}
</style>
