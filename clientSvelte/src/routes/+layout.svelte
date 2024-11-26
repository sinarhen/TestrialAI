<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>


<div class="bg-gradient-to-b px-40 py-20 min-h-screen w-full via-pink-100 via-30% from-white to-yellow-50 ">
    {@render children()}
</div>
