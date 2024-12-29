import type { ChatCompletionStreamParams } from 'openai/lib/ChatCompletionStream';
import type { ChatModel } from 'openai/resources/chat/chat';

type EnsureModelSupported<T extends ChatModel> = T;

export type SupportedModel = EnsureModelSupported<'gpt-4o' | 'gpt-4o-mini'>;

export interface CustomChatCompletionStreamParams
	extends Omit<ChatCompletionStreamParams, 'messages' | 'response_format'> {
	model: SupportedModel;
}
