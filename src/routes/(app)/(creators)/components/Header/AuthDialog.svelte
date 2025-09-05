<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogTrigger,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '@client/components/ui/dialog';
	import { Label } from '@client/components/ui/label';
	import { Input } from '@client/components/ui/input';
	import { Separator } from '@client/components/ui/separator';
	import { Button } from '@client/components/ui/button';
	import { LogIn } from 'lucide-svelte';
	import { api } from '@/client/api';
	import type { Provider } from '@/server/api/users/tables';
	import { toast } from 'svelte-sonner';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { parseClientResponse } from '@/client/utils/api';
	import { HTTPException } from 'hono/http-exception';

	// Allow external control of dialog state
	let {
		open = $bindable(false),
		onSuccessCallback,
		showTrigger = true
	}: {
		open?: boolean;
		onSuccessCallback?: () => void;
		showTrigger?: boolean;
	} = $props();

	// state variables for the dialog and form mode
	let isAuthDialogOpen = $state<boolean | undefined>(open);
	
	// Sync with external prop
	$effect(() => {
		isAuthDialogOpen = open;
	});
	let isLoginMode = $state<boolean>(true);
	let isSigningIn = $state<boolean>(false);

	// input states
	let email = $state<string | null>(null);
	let password = $state<string | null>(null);
	let username = $state<string | null>(null);
	let firstName = $state<string | null>(null);
	let lastName = $state<string | null>(null);
	let verificationCode = $state<string | null>(null);

	// track whether we have sent the verification code
	let isVerificationCodeSent = $state<boolean>(false);

	function toggleAuthMode() {
		// flip between "Login" and "Register"
		isLoginMode = !isLoginMode;
		isVerificationCodeSent = false;

		// clear out fields if switching
		email = null;
		password = null;
		username = null;
		firstName = null;
		lastName = null;
		verificationCode = null;
	}

	// Send verification code for registration
	const onSendVerificationCode = async () => {
		try {
			if (!email) {
				toast.error('Please enter your email');
				return;
			}
			if (!password) {
				toast.error('Please enter your password');
				return;
			}
			if (!username) {
				toast.error('Please enter a username');
				return;
			}

			isSigningIn = true;
			const resp = await api()
				.iam.register.request.$post({
					json: { email }
				})
				.then(parseClientResponse);
			if (resp.error) {
				toast.error(resp.error);
				return;
			}
			toast.success('Verification code sent!');
			isVerificationCodeSent = true;
		} catch (err) {
			toast.error('Something went wrong');
		} finally {
			isSigningIn = false;
		}
	};

	// Verify the code to finalize registration
	const onVerifyEmail = async () => {
		try {
			if (!email || !password || !username) {
				toast.error('Missing required fields');
				return;
			}
			if (!verificationCode) {
				toast.error('Please enter the verification code');
				return;
			}

			isSigningIn = true;
			const resp = await api()
				.iam.register.verify.$post({
					json: {
						email,
						password,
						username,
						firstName,
						lastName,
						verificationCode
					}
				})
				.then(parseClientResponse);
			if (!resp.error) {
				toast.success('Account created successfully');
				isAuthDialogOpen = false;
				open = false;
				// invalidate current page to refresh the user state
				invalidateAll();
				onSuccessCallback?.();
			} else {
				toast.error(resp.error);
				console.error(resp);
			}
		} catch (err) {
			toast.error('Something went wrong');
		} finally {
			isSigningIn = false;
		}
	};

	// Login flow
	const onLogin = async () => {
		try {
			if (!email) {
				toast.error('Please enter your email address');
				return;
			}
			if (!password) {
				toast.error('Please enter your password');
				return;
			}

			isSigningIn = true;
			const resp = await api()
				.iam.login.$post({
					json: { email, password }
				})
				.then(parseClientResponse);

			if (resp.error) {
				toast.error(resp.error);
				return;
			}

			invalidateAll();
			toast.success('Logged in successfully');
			isAuthDialogOpen = false;
			open = false;
			onSuccessCallback?.();
		} catch (err) {
			console.error(err);

			if (err instanceof Error) {
				toast.error(err.message);
				return;
			}
			toast.error('Something went wrong');
		} finally {
			isSigningIn = false;
		}
	};

	const _getAuthLinkForProvider = (provider: Provider) =>
		api()
			.iam.login[':provider'].$url({
				param: { provider }
			})
			.toString();

	const googleAuthLink = _getAuthLinkForProvider('google');
	const githubAuthLink = _getAuthLinkForProvider('github');
</script>

<Dialog
	open={isAuthDialogOpen}
	onOpenChange={() => {
		isAuthDialogOpen = !isAuthDialogOpen;
		open = isAuthDialogOpen;
	}}
>
	{#if showTrigger}
		<DialogTrigger>
			<Button size="sm" variant="outline" class="flex gap-x-2 text-sm">
				<LogIn size="14" />
				Login
			</Button>
		</DialogTrigger>
	{/if}
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{isLoginMode ? 'Login' : 'Register'}</DialogTitle>
			<DialogDescription>
				{#if isLoginMode}
					Please login to continue.
				{:else}
					Create an account to get started.
				{/if}
				<button class="underline" onclick={toggleAuthMode}>
					{isLoginMode ? 'Register?' : 'Already have an account? Login'}
				</button>
			</DialogDescription>
		</DialogHeader>

		<!-- If we're in Login Mode, show the login fields -->
		{#if isLoginMode}
			<div class="flex flex-col gap-x-4 gap-y-2">
				<div>
					<Label for="email-input" id="email-input-label">Email</Label>
					<Input
						required
						type="email"
						bind:value={email}
						class="sm:max-w-[270px]"
						id="email-input"
					/>
				</div>
				<div>
					<Label for="password-input" id="password-input-label">Password</Label>
					<Input
						required
						type="password"
						bind:value={password}
						class="sm:max-w-[270px]"
						id="password-input"
					/>
				</div>
				<Button disabled={isSigningIn} on:click={onLogin}>Login</Button>
			</div>
		{:else}
			<!-- Register Mode -->
			{#if isVerificationCodeSent}
				<!-- If verification code was sent, only show the code input + verify button -->
				<div class="flex flex-col gap-x-4 gap-y-2">
					<div>
						<Label for="code-input" id="code-input-label">Verification Code</Label>
						<Input
							required
							type="text"
							bind:value={verificationCode}
							class="sm:max-w-[270px]"
							id="code-input"
						/>
					</div>
					<Button disabled={isSigningIn} on:click={onVerifyEmail}>Verify</Button>
				</div>
			{:else}
				<!-- Show fields needed before sending verification code -->
				<div class="flex flex-col gap-x-4 gap-y-2">
					<div>
						<Label for="email-input" id="email-input-label">Email</Label>
						<Input
							required
							type="email"
							bind:value={email}
							class="sm:max-w-[270px]"
							id="email-input"
						/>
					</div>
					<div>
						<Label for="username-input" id="username-input-label">Username</Label>
						<Input
							required
							type="text"
							bind:value={username}
							class="sm:max-w-[270px]"
							id="username-input"
						/>
					</div>
					<div>
						<Label for="first-name-input" id="first-name-input-label">First Name</Label>
						<Input
							type="text"
							bind:value={firstName}
							class="sm:max-w-[270px]"
							id="first-name-input"
							placeholder="Optional"
						/>
					</div>
					<div>
						<Label for="last-name-input" id="last-name-input-label">Last Name</Label>
						<Input
							type="text"
							bind:value={lastName}
							class="sm:max-w-[270px]"
							id="last-name-input"
							placeholder="Optional"
						/>
					</div>
					<div>
						<Label for="password-input" id="password-input-label">Password</Label>
						<Input
							required
							type="password"
							bind:value={password}
							class="sm:max-w-[270px]"
							id="password-input"
						/>
					</div>
					<Button disabled={isSigningIn} on:click={onSendVerificationCode}>
						Send Verification Code
					</Button>
				</div>
			{/if}
		{/if}

		<!-- Divider + OAuth Buttons -->
		<div class="mt-4">
			<Separator class="mb-4" />
			<div class="flex flex-col items-center gap-x-2 gap-y-1 text-sm">
				<a class="w-full" href={githubAuthLink}>
					<Button disabled={isSigningIn} class="w-full" variant="outline">GitHub</Button>
				</a>
				<a class="w-full" href={googleAuthLink}>
					<Button disabled={isSigningIn} class="w-full" variant="outline">Google</Button>
				</a>
			</div>
		</div>
	</DialogContent>
</Dialog>
