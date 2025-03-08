import {useState} from 'react';
import {readConfig} from '../utils/config.js';

interface ApiOptions {
	model?: string;
	systemPrompt?: string;
}

export const useApi = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sendQuery = async (query: string, options: ApiOptions = {}) => {
		setIsLoading(true);
		setError(null);

		try {
			const config = readConfig();
			const model = options.model || config.defaultModel;

			// Find the provider for the selected model
			let provider = '';
			for (const [providerName, providerConfig] of Object.entries(
				config.providers,
			)) {
				if (providerConfig.models?.includes(model)) {
					provider = providerName;
					break;
				}
			}

			if (!provider) {
				throw new Error(`No provider found for model: ${model}`);
			}

			const apiKey = config.providers[provider]?.apiKey;
			if (!apiKey) {
				throw new Error(`No API key found for provider: ${provider}`);
			}

			// This is a placeholder for the actual API call implementation
			// In a real implementation, you would make an API call to the provider's API
			console.log(`Sending query to ${provider} model ${model}`);
			console.log(`Query: ${query}`);
			console.log(`System prompt: ${options.systemPrompt || 'default'}`);

			// Simulate API response
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Return a mock response for now
			return `Response to: ${query}`;
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
