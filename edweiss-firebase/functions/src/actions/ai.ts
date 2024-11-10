
/**
 * 		Don't abuse this.
*/

import 'dotenv/config';

import OpenAI from 'openai';

const prefferedModel: OpenAI.Chat.ChatModel = "gpt-4o-mini";

export const openaiClient = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // If you don't have .env with the api key, ask me.
});

export async function generalPrompt(prompt: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming) {
	return await openaiClient.chat.completions.create(prompt);
}

export default async function prompt<T>({ ...prompt }: { task: string, content: string, fallback: T }) {
	const result = await generalPrompt({
		messages: [{ role: "system", content: prompt.task }, { role: 'user', content: prompt.content }],
		model: prefferedModel,
		n: 1
	});
	const choice = result.choices[0];

	if (choice.finish_reason == 'stop' || choice.finish_reason == 'length')
		return choice.message.content as string;

	return prompt.fallback;
}
