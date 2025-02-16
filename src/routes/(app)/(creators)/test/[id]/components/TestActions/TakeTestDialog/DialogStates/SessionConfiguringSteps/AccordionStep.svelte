<script lang="ts">
	import * as Accordion from '@client/components/ui/accordion';

	const {
		disabled,
		label,
		value,
		class: className,
		children
	}: {
		disabled: boolean;
		class?: string;
		label: string;
		value: string;
		children: any;
	} = $props();
</script>

<Accordion.Item class={className} {value}>
	<Accordion.Trigger
		{disabled}
		class="flex justify-center text-sm font-medium hover:no-underline disabled:opacity-50"
	>
		{label}
	</Accordion.Trigger>
	<Accordion.Content>
		{@render children()}
	</Accordion.Content>
</Accordion.Item>
