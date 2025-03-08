import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import {
	readConfig,
	setDefaultModel,
	getAllModels,
	updateModelSystemPrompt,
	updateProviderDefaultSystemPrompt,
	getSystemPrompt,
} from '@/utils/config.js';

interface ModelInfo {
	provider: string;
	model: string;
}

interface ModelContextType {
	currentModel: string;
	currentProvider: string;
	availableModels: ModelInfo[];
	systemPrompt: string;
	setCurrentModel: (model: string) => void;
	updateSystemPrompt: (prompt: string) => void;
	updateDefaultSystemPrompt: (prompt: string) => void;
	refreshModels: () => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
	children: ReactNode;
}

export const ModelProvider: React.FC<ModelProviderProps> = ({children}) => {
	const config = readConfig();
	const [currentModel, setCurrentModelState] = useState<string>(
		config.defaultModel,
	);
	const [currentProvider, setCurrentProvider] = useState<string>('');
	const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
	const [systemPrompt, setSystemPrompt] = useState<string>('');

	// Initialize available models and current provider
	useEffect(() => {
		refreshModels();
	}, []);

	// Update system prompt when model changes
	useEffect(() => {
		setSystemPrompt(getSystemPrompt(currentModel));

		// Find provider for the current model
		const modelInfo = availableModels.find(m => m.model === currentModel);
		if (modelInfo) {
			setCurrentProvider(modelInfo.provider);
		}
	}, [currentModel, availableModels]);

	const refreshModels = () => {
		const models = getAllModels();
		setAvailableModels(models);

		// Find provider for the current model
		const modelInfo = models.find(m => m.model === currentModel);
		if (modelInfo) {
			setCurrentProvider(modelInfo.provider);
		}
	};

	const setCurrentModel = (model: string) => {
		setCurrentModelState(model);
		setDefaultModel(model);
	};

	const updateSystemPrompt = (prompt: string) => {
		updateModelSystemPrompt(currentModel, prompt);
		setSystemPrompt(prompt);
	};

	const updateDefaultSystemPrompt = (prompt: string) => {
		if (currentProvider) {
			updateProviderDefaultSystemPrompt(currentProvider, prompt);
			setSystemPrompt(prompt);
		}
	};

	const value = {
		currentModel,
		currentProvider,
		availableModels,
		systemPrompt,
		setCurrentModel,
		updateSystemPrompt,
		updateDefaultSystemPrompt,
		refreshModels,
	};

	return (
		<ModelContext.Provider value={value}>{children}</ModelContext.Provider>
	);
};

export const useModel = (): ModelContextType => {
	const context = useContext(ModelContext);

	if (context === undefined) {
		throw new Error('useModel must be used within a ModelProvider');
	}

	return context;
};
