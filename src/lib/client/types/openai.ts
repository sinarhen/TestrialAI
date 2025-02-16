import type { ChatModel } from 'openai/resources/index.mjs';
import OpenAI from 'openai';
type EnsureModelSupported<T extends ChatModel> = T;

export type SupportedModel = EnsureModelSupported<'gpt-4o' | 'gpt-4o-mini'>;

export interface CustomChatCompletionParams
	extends Omit<
		OpenAI.ChatCompletionCreateParams,
		'model' | 'max_tokens' | 'max_completion_tokens' | 'stream'
	> {
	model?: SupportedModel;
}
