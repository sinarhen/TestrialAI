<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>


<div class="bg-gradient-to-b md:px-40 lg:px-60 px-20 py-20 min-h-screen w-full via-pink-100 via-30% from-white to-yellow-50 ">
    {@render children()}
</div>
