import { inject } from '@needle-di/core';
import { ConfigService } from '@api/common/configs/config.service';
import OpenAI from 'openai';
import type { CustomChatCompletionParams } from '@/types/openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ZodType } from 'zod';

export class OpenAiBaseService {
	private client: OpenAI;

	constructor(private configService = inject(ConfigService)) {
		this.client = new OpenAI({
			apiKey: configService.envs.OPENAI_API_KEY
		});
	}

	protected createCompletion = <T extends ZodType>(
		responseSchema: T,
		customChatCompletionParams: CustomChatCompletionParams
	) => {
		return this.client.chat.completions.create({
			response_format: zodResponseFormat(
				responseSchema,
				// TODO: Awful hack to get the name of the schema
				`generate-${(responseSchema._def as any).typeName}`
			),
			...customChatCompletionParams,
			model: customChatCompletionParams.model || this.defaultModel,
			max_completion_tokens: this.configService.envs.OPENAI_COMPLETION_TOKEN_LIMIT,
			stream_options: customChatCompletionParams.stream ? { include_usage: true } : undefined,
			stream: true
		});
	};

	private get defaultModel() {
		return this.configService.envs.OPENAI_DEFAULT_MODEL;
	}
}
