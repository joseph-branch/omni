import fs from 'fs';
import path from 'path';
import os from 'os';

// Define the config directory and file path
const CONFIG_DIR = path.join(os.homedir(), '.omni');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Define the configuration interface
export interface OmniConfig {
	defaultModel: string;
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
	providers: {
		openai: {
			apiKey: '',
			models: [
				'gpt-4',
				'gpt-4o',
				'gpt-4o-mini',
				'gpt-4.5',
				'o1',
				'o1-mini',
				'o3',
				'o3-mini',
				'o3-mini-high',
			],
			enabled: true,
			defaultSystemPrompt: 'You are a helpful assistant.',
			modelSystemPrompts: {
				'gpt-4o': 'You are a helpful assistant powered by GPT-4o.',
				o1: "You are a helpful assistant powered by o1, OpenAI's most advanced model.",
			},
		},
		anthropic: {
			apiKey: '',
			models: [
				'claude-v3-haiku',
				'claude-v3-sonnet',
				'claude-v3-opus',
				'claude-v3.5-sonnet',
				'claude-v3.5-haiku',
				'claude-v3.7-sonnet',
			],
			enabled: false,
			defaultSystemPrompt: 'You are Claude, a helpful AI assistant.',
			modelSystemPrompts: {
				'claude-v3-opus':
					"You are Claude Opus, Anthropic's most capable model.",
				'claude-v3.7-sonnet':
					'You are Claude 3.7 Sonnet, a helpful and harmless AI assistant.',
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
