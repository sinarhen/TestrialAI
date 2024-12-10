<script lang="ts">
    import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Separator } from '@/components/ui/separator';
    import { Button } from '@/components/ui/button';
    import { LogIn } from 'lucide-svelte';
    import type {ActionData} from "../../../../.svelte-kit/types/src/routes/$types";

    let {form} : {
        form: ActionData
    } = $props();

    let isAuthDialogOpen: boolean = $state(!!form?.message);
    let isLoginMode: boolean = $state(true);

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
    }
</script>

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
                <Label for="username-input" id="username-input-label">Username</Label>
                <Input required type="text" name="username" class="sm:max-w-[270px]" id="username-input" />
            </div>
            {#if !isLoginMode}
                <div class="col-span-1">
                    <Label for="email-input" id="email-input-label">Email</Label>
                    <Input required type="email" name="email" class="sm:max-w-[270px]" id="email-input" />
                </div>
            {/if}
            <div class="col-span-1">
                <Label for="password-input" id="password-input-label">Password</Label>
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
                <Button class="w-full" variant="outline">Github</Button>
                <Button class="w-full" variant="outline">Google</Button>
            </div>
        </div>
    </DialogContent>
</Dialog>