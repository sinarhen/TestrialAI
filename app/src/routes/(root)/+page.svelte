<script lang="ts">
	import '../../app.css';
	import Greeting from './components/Greeting.svelte';
	// import ExportSection from './components/ExportSection.svelte';
	import QuestionList from '../generate/components/QuestionList/QuestionList.svelte';
	import { CircleHelp, Gauge, Timer } from 'lucide-svelte';
	import { currentSurveyStore } from '@/stores/questions.svelte.js';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<Greeting userName={data.user?.username} />
