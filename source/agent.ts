import {generateText} from 'ai';
import {readConfig, getSystemPrompt} from './utils/config.js';
import {getModel, models} from './utils/config.js';
import {tools} from './tools/index.js';
import {Message} from './contexts/MessageContext.js';

const config = readConfig();

export const getAIResponse = async (
	prompt: string,
	messages: Message[],
	modelName?: string,
	providerName?: string,
) => {
	try {
		// Create a copy of the messages to avoid mutating the original array
		const messagesCopy = [...messages];

		// Get the system prompt for the specified model
		const useModelName = modelName || config.defaultModel;
		const systemPrompt = getSystemPrompt(useModelName);

		// Check if there's already a system message at the beginning
		const hasSystemMessage =
			messagesCopy.length > 0 && (messagesCopy[0] as Message).role === 'system';

		// If no system message exists, add one at the beginning
		if (!hasSystemMessage && systemPrompt && systemPrompt.trim() !== '') {
			messagesCopy.unshift({
				role: 'system',
				content: systemPrompt,
			});
		}

		// Add the user's prompt as a message
		messagesCopy.push({role: 'user', content: prompt});

		// Use provided model and provider or fall back to defaults
		const useProviderName = providerName || config.defaultProvider;

		// Get the model instance
		let model;
		if (useModelName && useProviderName) {
			// Try to get the model from the specified provider
			const providerModels =
				models[useProviderName as keyof typeof models]?.models;
			if (providerModels) {
				model = providerModels[useModelName as keyof typeof providerModels];
			}
		}

		// Fall back to getModel() if we couldn't get the specific model
		if (!model) {
			model = getModel();
		}

		const {text} = await generateText({
			model,
			tools: tools,
			maxSteps: 15,
			system: systemPrompt,
			maxRetries: 3,
			messages: messagesCopy.slice(-10),
		});

		// Don't modify the original messages array
		return text;
	} catch (error) {
		console.error(error);
		return 'An error occurred while generating the response.';
	}
};
