import {useState} from 'react';
import {readConfig} from '@/utils/config.js';
import {getAIResponse} from '@/agent.js';
import {useModel} from '@/contexts/ModelContext.js';
import {Message} from '@/contexts/MessageContext.js';

export const useApi = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const {currentModel, currentProvider} = useModel();

	const sendQuery = async (query: string, messages: Message[]) => {
		setIsLoading(true);
		setError(null);

		try {
			const config = readConfig();
			// Use the currentModel from context instead of config.defaultModel
			const model = currentModel;

			// Use currentProvider from context if available, otherwise find it
			let provider = currentProvider;
			if (!provider) {
				// Find the provider for the selected model
				for (const [providerName, providerConfig] of Object.entries(
					config.providers,
				)) {
					if (providerConfig.models?.includes(model)) {
						provider = providerName;
						break;
					}
				}
			}

			if (!provider) {
				throw new Error(`No provider found for model: ${model}`);
			}

			const apiKey = config.providers[provider]?.apiKey;
			if (!apiKey) {
				throw new Error(`No API key found for provider: ${provider}`);
			}

			// Pass the current model and provider to getAIResponse
			const response = await getAIResponse(query, messages, model, provider);
			return response;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Unknown error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		sendQuery,
		isLoading,
		error,
	};
};
