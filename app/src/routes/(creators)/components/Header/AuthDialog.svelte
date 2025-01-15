<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogTrigger,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '@/components/ui/dialog';
	import { Label } from '@/components/ui/label';
	import { Input } from '@/components/ui/input';
	import { Separator } from '@/components/ui/separator';
	import { Button } from '@/components/ui/button';
	import { LogIn } from 'lucide-svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { ActionData } from '../(root)/$types';

	let {
		form
	}: {
		form: ActionData;
	} = $props();

	let isAuthDialogOpen: boolean = $state(!!form?.message);
	let isLoginMode: boolean = $state(true);
	let isSigningIn = $state(false);

	function toggleAuthMode() {
		isLoginMode = !isLoginMode;
	}
	const onLogin: SubmitFunction = () => {
		isSigningIn = true;
		return async ({ result }) => {
			switch (result.type) {
				case 'success':
					toast.success('Successfully logged in');
					isAuthDialogOpen = false;
					break;
				case 'error':
					toast.error(result.error);
					break;
				default:
					break;
			}

			await applyAction(result);
			await invalidateAll();
			isSigningIn = false;
		};
	};
</script>

<Dialog
	open={isAuthDialogOpen}
	onOpenChange={() => {
		isAuthDialogOpen = !isAuthDialogOpen;
	}}
>
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
		<form
			method="POST"
			use:enhance={onLogin}
			action={isLoginMode ? '?/login' : '?/register'}
			class="flex flex-col gap-x-4 gap-y-2"
		>
			<div class="col-span-1">
				<Label for="username-input" id="username-input-label">Username</Label>
				<Input required type="text" name="username" class="sm:max-w-[270px]" id="username-input" />
				{#if form?.username}
					<p class="text-sm text-red-500">{form.username}</p>
				{/if}
			</div>
			{#if !isLoginMode}
				<div class="col-span-1">
					<Label for="email-input" id="email-input-label">Email</Label>
					<Input required type="email" name="email" class="sm:max-w-[270px]" id="email-input" />
				</div>
			{/if}
			<div class="col-span-1">
				<Label for="password-input" id="password-input-label">Password</Label>
				<Input
					required
					type="password"
					name="password"
					class="sm:max-w-[270px]"
					id="password-input"
				/>
				{#if form?.password}
					<p class="text-sm text-red-500">{form.password}</p>
				{/if}
			</div>
			{#if form?.message}
				<p class="text-sm text-red-500">{form?.message}</p>
			{/if}
			<Button disabled={isSigningIn} type="submit" class="w-full sm:w-auto"
				>{isLoginMode ? 'Login' : 'Register'}</Button
			>
		</form>
		<div id="login-dialog-footer">
			<Separator class="mb-4" />
			<div class="flex flex-col items-center gap-x-2 gap-y-1 text-sm">
				<Button disabled={isSigningIn} class="w-full" variant="outline">Github</Button>
				<Button disabled={isSigningIn} class="w-full" variant="outline">Google</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>
