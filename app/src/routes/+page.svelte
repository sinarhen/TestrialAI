<script lang="ts">
    import '../app.css';
    import Greeting from './components/Greeting.svelte';
    import QuestionList from './components/QuestionList.svelte';
    import ExportSection from './components/ExportSection.svelte';
    import type { ActionData, PageServerData } from './$types';
    import { Button } from '@/components/ui/button';
    import { LogIn } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Separator } from '@/components/ui/separator';

    let topic = $state("");
    let { data, form }: { data: PageServerData, form: ActionData } = $props();
    let isAuthDialogOpen: boolean = $state(!!form?.message);
    let isLoginMode: boolean = $state(true); // Track whether we're in login or register mode

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
    }

    function onCreateSurvey() {
        topic = "Survey";
    }
</script>

<header class="flex h-12 pt-4 w-full justify-end">
    {#if data.user}
        <div class="flex gap-x-4 items-center">
            <p class="text-sm">Welcome, {data.user.username}</p>
            <Button variant="outline" size="sm" href="?/logout">Logout</Button>
        </div>
        {:else}
        <Dialog open={isAuthDialogOpen} onOpenChange={() => { isAuthDialogOpen = !isAuthDialogOpen }}>
            <DialogTrigger>
                <Button size="sm" variant="outline" class="flex gap-x-2 text-sm">
                    <LogIn size="14" />
                    Login
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isLoginMode ? 'Login' : 'Register'}</DialogTitle>
                    <DialogDescription>
                        {isLoginMode ? 'Please login to continue.' : 'Create an account to get started.'}
                        <button class="underline" onclick={toggleAuthMode}>
                            {isLoginMode ? 'Register?' : 'Already have an account? Login'}
                        </button>
                    </DialogDescription>
                </DialogHeader>
                <form method="POST" action={isLoginMode ? '?/login' : '?/register'} class="flex flex-col gap-y-2 gap-x-4">
                    <div class="col-span-1">
                        <Label for="username-input" id="username-input-label">
                            Username
                        </Label>
                        <Input required type="text" name="username" class="sm:max-w-[270px]" id="username-input" />
                    </div>
                    {#if !isLoginMode}
                        <!-- Additional fields for registration -->
                        <div class="col-span-1">
                            <Label for="email-input" id="email-input-label">
                                Email
                            </Label>
                            <Input required type="email" name="email" class="sm:max-w-[270px]" id="email-input" />
                        </div>
                    {/if}
                    <div class="col-span-1">
                        <Label for="password-input" id="password-input-label">
                            Password
                        </Label>
                        <Input required type="password" name="password" class="sm:max-w-[270px]" id="password-input" />
                    </div>
                    {#if form?.message}
                        <p class="text-red-500 text-sm">{form.message}</p>
                    {/if}
                    <Button type="submit" class="sm:w-auto w-full">{isLoginMode ? 'Login' : 'Register'}</Button>
                </form>
                <div id="login-dialog-footer">
                    <Separator class="mb-4" />
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
    {/if}
</header>

<Greeting bind:topic  onCreateSurvey={onCreateSurvey} />

<h2 class="font-bold text-2xl">Geography test</h2>
<div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
    <QuestionList />
    <ExportSection />
</div>