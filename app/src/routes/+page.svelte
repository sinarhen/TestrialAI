<script lang="ts">
    import '../app.css';
    import Greeting from './components/Greeting.svelte';
    import QuestionList from './components/QuestionList.svelte';
    import ExportSection from './components/ExportSection.svelte';
    import type { ActionData, PageServerData } from './$types';
    import { Button } from '@/components/ui/button';
    import { Github, LogIn } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Separator } from '@/components/ui/separator';
    import type { Action } from '@sveltejs/kit';


    let topic = $state("");
    function onCreateSurvey() {
        // Logic to handle survey creation
    }

    let { data, form }: { data: PageServerData, form: ActionData } = $props();

    let isAuthDialogOpen: boolean = $state(!!form?.message);

</script>
<header class="flex h-12 pt-4 w-full justify-end">

    <Dialog open={isAuthDialogOpen} onOpenChange={() => {isAuthDialogOpen = !isAuthDialogOpen}}>
        <DialogTrigger >
            <Button size="sm" variant="outline" class="flex gap-x-2 text-sm">
                <LogIn size="14" />
                Login
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>
                    Please login to continue.
                    <button class="underline">Register? </button>
                </DialogDescription>
            </DialogHeader>
            <form method="POST" action="?/{'login'}" class="flex flex-col gap-y-2 gap-x-4">
                <div class="col-span-1">
                    <Label for="login-input" id="login-input-label">
                        Username
                    </Label>
                    <Input required type="text"  class="sm:max-w-[270px]" id="login-input"/>
                </div>
                <div class="col-span-1">
                    <Label for="password-input" id="password-input-label">
                        Password
                    </Label>
                    <Input required class="sm:max-w-[270px]" id="password-input" type="password"/>
                </div>
                {#if form?.message}
                    <p class="text-red-500 text-sm">{form.message}</p>
                {/if}
                <Button type="submit" class="sm:w-auto w-full">Login</Button>
            </form>
            <div id="login-dialog-footer" >
                <Separator class="mb-4"/>
                <div class="flex flex-col gap-y-1 gap-x-2 text-sm items-center">
                    <Button class="w-full" variant="outline">
                        Github
                    </Button>
                    <Button class="w-full" variant="outline">
                        Google
                    </Button>
                </div>

            </div>

        </DialogContent>
    </Dialog>

</header>

<Greeting bind:topic onCreateSurvey={onCreateSurvey} />

<h2 class="font-bold text-2xl">Geography test</h2>
<div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
    <QuestionList />
    <ExportSection />
</div>
