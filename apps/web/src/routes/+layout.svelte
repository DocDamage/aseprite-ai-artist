<script lang="ts">
	import { AppLayout } from '$app-shell/layout';

	let { children } = $props();
</script>

<AppLayout>
	{@render children()}
</AppLayout>
