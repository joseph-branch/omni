import fs from 'fs';
import path from 'path';
import os from 'os';
import {createOpenAI} from '@ai-sdk/openai';
import {createAnthropic} from '@ai-sdk/anthropic';
import {createMistral} from '@ai-sdk/mistral';
import {createGoogleGenerativeAI} from '@ai-sdk/google';

// Define the config directory and file path
const CONFIG_DIR = path.join(os.homedir(), '.omni');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Define the configuration interface
export interface OmniConfig {
	defaultModel: string;
	defaultProvider: string;
	providers: {
		[key: string]: {
			apiKey?: string;
			models?: string[];
			enabled?: boolean;
			defaultSystemPrompt?: string;
			modelSystemPrompts?: {
				[modelName: string]: string;
			};
		};
	};
	initialization?: {
		completed: boolean;
		currentStep?: string;
		selectedProviders?: string[];
	};
}

// Default configuration
const DEFAULT_CONFIG: OmniConfig = {
	defaultModel: 'gpt-4o',
	defaultProvider: 'openai',
	providers: {
		openai: {
			apiKey: '',
			models: [
				'gpt-4o',
				'gpt-4o-mini',
				'gpt-4.5',
				'o1',
				'o1-mini',
				'o3-mini',
				'o3-mini-high',
			],
			enabled: true,
			defaultSystemPrompt: 'You are a helpful assistant.',
			modelSystemPrompts: {
				'gpt-4o': 'You are a helpful assistant powered by GPT-4o.',
				'gpt-4o-mini': 'You are a helpful assistant powered by GPT-4o-mini.',
				'gpt-4.5': 'You are a helpful assistant powered by GPT-4.5.',
				o1: "You are a helpful assistant powered by o1, OpenAI's most advanced model.",
				'o1-mini':
					"You are a helpful assistant powered by o1-mini, OpenAI's most advanced model.",
				'o3-mini':
					"You are a helpful assistant powered by o3-mini, OpenAI's most advanced model.",
				'o3-mini-high':
					"You are a helpful assistant powered by o3-mini-high, OpenAI's most advanced model.",
			},
		},
		anthropic: {
			apiKey: '',
			models: [
				'claude-3-5-sonnet-latest',
				'claude-3-5-haiku-latest',
				'claude-3-sonnet-20240229',
				'claude-3-haiku-20240307',
				'claude-3-7-sonnet-latest',
			],
			enabled: false,
			defaultSystemPrompt: 'You are Claude, a helpful AI assistant.',
			modelSystemPrompts: {
				'claude-v3-opus':
					'You are Claude Opus, a helpful and harmless AI assistant.',
				'claude-v3.7-sonnet':
					"You are Claude 3.7 Sonnet, Anthropic's most capable model.",
				'claude-v3.5-sonnet':
					"You are Claude 3.5 Sonnet, Anthropic's most capable model.",
				'claude-v3.5-haiku':
					"You are Claude 3.5 Haiku, Anthropic's most capable model.",
				'claude-v3-haiku':
					"You are Claude 3 Haiku, Anthropic's most capable model.",
				'claude-v3-sonnet':
					"You are Claude 3 Sonnet, Anthropic's most capable model.",
			},
		},
		mistral: {
			apiKey: '',
			models: ['mistral-small', 'mistral-medium', 'mistral-large'],
			enabled: false,
			defaultSystemPrompt: 'You are a helpful AI assistant by Mistral AI.',
			modelSystemPrompts: {
				'mistral-large':
					'You are Mistral Large, the most powerful model from Mistral AI.',
			},
		},
		gemini: {
			apiKey: '',
			models: ['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'],
			enabled: false,
			defaultSystemPrompt: 'You are a helpful AI assistant by Google.',
			modelSystemPrompts: {
				'gemini-1.5-pro':
					"You are Gemini 1.5 Pro, Google's most advanced model.",
				'gemini-2.0-flash':
					"You are Gemini 2.0 Flash, Google's most advanced model.",
				'gemini-1.5-flash': "You are Gemini 1.5 Flash, Google's fastest model.",
			},
		},
	},
	initialization: {
		completed: false,
		currentStep: 'welcome',
	},
};

/**
 * Check if the config file exists
 */
export function configExists(): boolean {
	return fs.existsSync(CONFIG_FILE);
}

/**
 * Initialize the config directory and file
 */
export function initConfig(): OmniConfig {
	// Create config directory if it doesn't exist
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, {recursive: true});
	}

	// Create default config file
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));

	return DEFAULT_CONFIG;
}

/**
 * Read the config file
 */
export function readConfig(): OmniConfig {
	if (!configExists()) {
		return initConfig();
	}

	const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
	return JSON.parse(configData) as OmniConfig;
}

/**
 * Update the config file
 */
export function updateConfig(config: OmniConfig): void {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, {recursive: true});
	}

	fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Update a specific provider's API key
 */
export function updateProviderApiKey(provider: string, apiKey: string): void {
	const config = readConfig();

	if (!config.providers[provider]) {
		config.providers[provider] = {apiKey};
	} else {
		config.providers[provider].apiKey = apiKey;
	}

	updateConfig(config);
}

/**
 * Set the default model
 */
export function setDefaultModel(model: string): void {
	const config = readConfig();
	config.defaultModel = model;

	// Find the provider for this model
	let provider = '';
	for (const [providerName, providerConfig] of Object.entries(
		config.providers,
	)) {
		if (providerConfig.models?.includes(model)) {
			provider = providerName;
			break;
		}
	}

	if (provider) {
		config.defaultProvider = provider;
	}

	updateConfig(config);
}

/**
 * Get all available models from all providers
 */
export function getAllModels(): {provider: string; model: string}[] {
	const config = readConfig();
	const allModels: {provider: string; model: string}[] = [];

	Object.entries(config.providers).forEach(([provider, providerConfig]) => {
		if (providerConfig.models) {
			providerConfig.models.forEach(model => {
				allModels.push({provider, model});
			});
		}
	});

	return allModels;
}

/**
 * Delete the config file and optionally the config directory
 */
export function deleteConfig(removeDirectory = false): boolean {
	try {
		if (fs.existsSync(CONFIG_FILE)) {
			fs.unlinkSync(CONFIG_FILE);
		}

		if (removeDirectory && fs.existsSync(CONFIG_DIR)) {
			fs.rmdirSync(CONFIG_DIR);
		}

		return true;
	} catch (error) {
		console.error('Error deleting config:', error);
		return false;
	}
}

/**
 * Update the initialization state
 */
export function updateInitializationState(
	stepId: string,
	completed = false,
	selectedProviders?: string[],
): void {
	const config = readConfig();

	if (!config.initialization) {
		config.initialization = {
			completed: false,
			currentStep: 'welcome',
		};
	}

	config.initialization.currentStep = stepId;
	config.initialization.completed = completed;

	if (selectedProviders) {
		config.initialization.selectedProviders = selectedProviders;
	}

	updateConfig(config);
}

/**
 * Check if initialization is completed
 */
export function isInitializationCompleted(): boolean {
	const config = readConfig();
	return config.initialization?.completed || false;
}

/**
 * Get the current initialization step
 */
export function getCurrentInitializationStep(): string {
	const config = readConfig();
	return config.initialization?.currentStep || 'welcome';
}

/**
 * Get the selected providers from initialization state
 */
export function getSelectedProviders(): string[] {
	const config = readConfig();
	return config.initialization?.selectedProviders || ['openai'];
}

/**
 * Reset the initialization state
 */
export function resetInitializationState(): void {
	const config = readConfig();

	config.initialization = {
		completed: false,
		currentStep: 'welcome',
	};

	updateConfig(config);
}

/**
 * Get the system prompt for a specific model
 * @param model The model name
 * @returns The system prompt for the model, or the provider's default, or a generic default
 */
export function getSystemPrompt(model: string): string {
	const config = readConfig();
	const allModels = getAllModels();
	const modelInfo = allModels.find(m => m.model === model);

	if (!modelInfo) {
		return 'You are a helpful assistant.';
	}

	const provider = config.providers[modelInfo.provider];

	if (!provider) {
		return 'You are a helpful assistant.';
	}

	// Check if there's a model-specific system prompt
	if (provider.modelSystemPrompts && provider.modelSystemPrompts[model]) {
		return provider.modelSystemPrompts[model];
	}

	// Fall back to the provider's default system prompt
	if (provider.defaultSystemPrompt) {
		return provider.defaultSystemPrompt;
	}

	// Final fallback to a generic system prompt
	return 'You are a helpful assistant.';
}

/**
 * Update the system prompt for a specific model
 * @param model The model name
 * @param systemPrompt The new system prompt
 */
export function updateModelSystemPrompt(
	model: string,
	systemPrompt: string,
): void {
	const config = readConfig();
	const allModels = getAllModels();
	const modelInfo = allModels.find(m => m.model === model);

	if (!modelInfo) {
		return;
	}

	const provider = config.providers[modelInfo.provider];

	if (!provider) {
		return;
	}

	// Initialize modelSystemPrompts if it doesn't exist
	if (!provider.modelSystemPrompts) {
		provider.modelSystemPrompts = {};
	}

	// Update the system prompt for the model
	provider.modelSystemPrompts[model] = systemPrompt;

	// Save the updated config
	updateConfig(config);
}

/**
 * Update the default system prompt for a provider
 * @param providerName The provider name
 * @param systemPrompt The new default system prompt
 */
export function updateProviderDefaultSystemPrompt(
	providerName: string,
	systemPrompt: string,
): void {
	const config = readConfig();
	const provider = config.providers[providerName];

	if (!provider) {
		return;
	}

	// Update the default system prompt for the provider
	provider.defaultSystemPrompt = systemPrompt;

	// Save the updated config
	updateConfig(config);
}

const config = readConfig();

export const getModel = () => {
	const defaultModel = config.defaultModel;
	const provider = config.defaultProvider;

	const providerConfig = config.providers[provider];
	if (!providerConfig) {
		throw new Error(`Provider ${provider} not found`);
	}

	// Get the appropriate model based on provider
	let model;
	switch (provider) {
		case 'openai':
			model =
				models.openai.models[defaultModel as keyof typeof models.openai.models];
			break;
		case 'anthropic':
			model =
				models.anthropic.models[
					defaultModel as keyof typeof models.anthropic.models
				];
			break;
		case 'mistral':
			model =
				models.mistral.models[
					defaultModel as keyof typeof models.mistral.models
				];
			break;
		case 'gemini':
			model =
				models.gemini.models[defaultModel as keyof typeof models.gemini.models];
			break;
		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}

	if (!model) {
		throw new Error(`Model ${defaultModel} not found for provider ${provider}`);
	}

	return model;
};

const openai = createOpenAI({
	apiKey: readConfig().providers['openai']?.apiKey,
});

const anthropic = createAnthropic({
	apiKey: readConfig().providers['anthropic']?.apiKey,
});

const mistral = createMistral({
	apiKey: readConfig().providers['mistral']?.apiKey,
});

const google = createGoogleGenerativeAI({
	apiKey: readConfig().providers['gemini']?.apiKey,
});

export const models = {
	openai: {
		models: {
			'gpt-4o': openai('gpt-4o'),
			'gpt-4o-mini': openai('gpt-4o-mini'),
			'gpt-4.5': openai('gpt-4.5'),
		},
	},
	anthropic: {
		models: {
			'claude-3-5-sonnet-latest': anthropic('claude-3-5-sonnet-latest'),
			'claude-3-5-haiku-latest': anthropic('claude-3-5-haiku-latest'),
			'claude-3-sonnet-20240229': anthropic('claude-3-sonnet-20240229'),
			'claude-3-haiku-20240307': anthropic('claude-3-haiku-20240307'),
			'claude-3-7-sonnet-latest': anthropic('claude-3-7-sonnet-latest'),
		},
	},
	mistral: {
		models: {
			'mistral-small': mistral('mistral-small'),
			'mistral-medium': mistral('mistral-medium'),
			'mistral-large': mistral('mistral-large'),
		},
	},
	gemini: {
		models: {
			'gemini-1.5-pro': google('gemini-1.5-pro'),
			'gemini-2.0-flash': google('gemini-2.0-flash'),
			'gemini-1.5-flash': google('gemini-1.5-flash'),
		},
	},
};
