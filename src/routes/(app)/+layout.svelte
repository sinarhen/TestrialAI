<script lang="ts">
	import '../../app.css';
	let { children }: { children: any } = $props();
</script>

<main
	class="h-auto min-h-screen w-full bg-gradient-to-b from-white via-pink-100 via-30% to-yellow-50 px-20 pb-20 md:px-40 lg:px-60"
>
	{@render children()}
</main>
