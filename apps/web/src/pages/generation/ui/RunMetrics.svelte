<script lang="ts">
	import { Table } from '$shared/ui/8bit';
	import type { StepMetricsView } from '$entities/generation';

	interface Props {
		metrics: StepMetricsView[];
	}

	let { metrics }: Props = $props();

	type Field = 'minutes' | 'toolCalls' | 'outputTokens' | 'costUsd';
	const columns: { id: Field; label: string; format: (value: number) => string }[] = [
		{ id: 'minutes', label: 'Minutes', format: (value) => String(Math.round(value * 10) / 10) },
		{ id: 'toolCalls', label: 'Tool calls', format: (value) => value.toLocaleString('en') },
		{ id: 'outputTokens', label: 'Output tokens', format: (value) => value.toLocaleString('en') },
		{ id: 'costUsd', label: 'Cost', format: (value) => `$${value.toFixed(2)}` }
	];

	/** Sum of the values present; null when no step reported the field. */
	const totals = $derived(
		Object.fromEntries(
			columns.map(({ id }) => {
				const present = metrics.flatMap((step) => (step[id] === undefined ? [] : [step[id]]));
				return [id, present.length === 0 ? null : present.reduce((sum, value) => sum + value, 0)];
			})
		) as Record<Field, number | null>
	);
</script>

{#if metrics.length > 0}
	<section aria-labelledby="metrics">
		<h2 id="metrics" class="text-sm sm:text-base">Run metrics</h2>
		<p class="text-muted-foreground mt-2 text-sm">What each step cost, as the harness reported it.</p>
		<div class="mt-5 overflow-x-auto px-2 pb-2">
			<Table.Root font="normal" containerClass="w-full min-w-max" class="text-sm">
				<caption class="sr-only">Time, tool calls, output tokens and cost per step</caption>
				<Table.Header>
					<Table.Row>
						<Table.Head class="retro text-[0.625rem]">Step</Table.Head>
						{#each columns as column (column.id)}
							<Table.Head class="retro text-right text-[0.625rem]">{column.label}</Table.Head>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each metrics as step (step.step)}
						<Table.Row>
							<Table.Head scope="row" class="text-foreground font-medium">{step.step}</Table.Head>
							{#each columns as column (column.id)}
								{@const value = step[column.id]}
								<Table.Cell class="text-right tabular-nums">{value === undefined ? '—' : column.format(value)}</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
					<Table.Row class="last:border-b-0">
						<Table.Head scope="row" class="retro text-foreground text-[0.625rem]">Total</Table.Head>
						{#each columns as column (column.id)}
							{@const total = totals[column.id]}
							<Table.Cell class="text-right font-medium tabular-nums">{total === null ? '—' : column.format(total)}</Table.Cell>
						{/each}
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
	</section>
{/if}
