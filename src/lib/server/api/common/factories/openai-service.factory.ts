import { inject } from '@needle-di/core';
import { ConfigService } from '@api/common/configs/config.service';
import OpenAI from 'openai';
import type { CustomChatCompletionParams } from '@/types/openai';

export class OpenAiBaseService {
	private client: OpenAI;

	constructor(protected configService = inject(ConfigService)) {
		this.client = new OpenAI({
			apiKey: configService.envs.OPENAI_API_KEY
		});
	}

	protected createCompletionStream = (customChatCompletionParams: CustomChatCompletionParams) => {
		return this.client.chat.completions.create({
			...customChatCompletionParams,
			model: customChatCompletionParams.model || this.defaultModel,
			max_completion_tokens: this.configService.envs.OPENAI_COMPLETION_TOKEN_LIMIT,
			stream_options: { include_usage: true },
			stream: true
		});
	};

	private get defaultModel() {
		return this.configService.envs.OPENAI_DEFAULT_MODEL;
	}
}
