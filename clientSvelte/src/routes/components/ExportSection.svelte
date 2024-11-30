<script lang="ts">
    import { Button } from "@/components/ui/button";
</script>

<section class="flex top-1/4 flex-col sticky h-1/2 w-full mt-14 xl:mt-0">
    <h5 class="text-lg font-semibold text-center">Export</h5>
    <div class="grid grid-cols-2 gap-2 w-full mt-4 xl:h-full xl:mt-6 max-h-[20rem] items-center">
        <Button variant="ghost" class="h-16 xl:h-full border enabled:hover:bg-blue-500 col-span-2 xl:col-span-1 rounded-sm flex items-center justify-center">
            <h4 class="font-bold">Google Forms</h4>
        </Button>
        <Button variant="ghost" class="h-16 xl:h-full border col-span-2 xl:col-span-1 rounded-sm flex items-center justify-center">
            <h4 class="font-bold">Microsoft Forms</h4>
        </Button>
        <Button variant="ghost" class="h-16 xl:h-full border enabled:hover:bg-red-400 col-span-2 xl:col-span-2 rounded-sm flex items-center justify-center">
            <h4 class="font-bold">PDF</h4>
        </Button>
    </div>
</section>