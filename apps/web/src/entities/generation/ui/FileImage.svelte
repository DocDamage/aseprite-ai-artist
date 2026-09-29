<script lang="ts">
	import { PixelImage } from '$shared/ui/pixel';
	import type { FileView } from '../model/types';

	interface Props {
		file: FileView;
		alt: string;
		max: number;
		eager?: boolean;
		class?: string;
	}

	let { file, alt, max, eager = false, class: className }: Props = $props();
</script>

<PixelImage
	src={file.url}
	width={file.width}
	height={file.height}
	pixel={file.pixel}
	{alt}
	{max}
	{eager}
	class={className}
/>
