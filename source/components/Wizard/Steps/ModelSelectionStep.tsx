import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '@/hooks/useWizard.js';
import {
	getAllModels,
	setDefaultModel,
	readConfig,
} from '@/utils/config.js';

export interface ModelSelectionStepProps {
	nextStepId?: string;
	onSelect?: (model: string, provider: string) => void;
}

export default function ModelSelectionStep({
	nextStepId,
	onSelect,
}: ModelSelectionStepProps) {
	const {goToNextStep, goToStep} = useWizard();
	const [selectedModelIndex, setSelectedModelIndex] = useState(0);
	const [models, setModels] = useState<{provider: string; model: string}[]>([]);
	const [message, setMessage] = useState<string>('');

	// Load models from enabled providers
	useEffect(() => {
		const allModels = getAllModels();
		// Filter to only include models from enabled providers
		const enabledModels = allModels.filter(model => {
			const providerConfig = readConfig().providers[model.provider];
			return providerConfig && providerConfig.enabled;
		});

		setModels(enabledModels);

		// If no models are available, add a default one
		if (enabledModels.length === 0) {
			setModels([{provider: 'openai', model: 'gpt-4o'}]);
		}
	}, []);

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelectedModelIndex(prev => (prev > 0 ? prev - 1 : prev));
		} else if (key.downArrow) {
			setSelectedModelIndex(prev =>
				prev < models.length - 1 ? prev + 1 : prev,
			);
		} else if (key.return && models.length > 0) {
			const selectedModel = models[selectedModelIndex];
			if (selectedModel) {
				// Save the selected model as default
				setDefaultModel(selectedModel.model);

				// Call the onSelect callback if provided
				if (onSelect) {
					onSelect(selectedModel.model, selectedModel.provider);
				}

				setMessage(`Default model set to ${selectedModel.model}!`);

				// Navigate to the next step after a delay
				setTimeout(() => {
					setMessage('');
					if (nextStepId) {
						goToStep(nextStepId);
					} else {
						goToNextStep();
					}
				}, 1500);
			}
		}
	});

	return (
		<BaseStep
			title="Default Model Selection"
			footer={
				<Text>
					Use <Text color="yellow">↑/↓</Text> to navigate and{' '}
					<Text color="green">Enter</Text> to select.
				</Text>
			}
		>
			<Text>Select your default model:</Text>
			<Box flexDirection="column" marginY={1}>
				{models.length > 0 ? (
					models.map((model, index) => (
						<Text
							key={`${model.provider}-${model.model}`}
							color={index === selectedModelIndex ? 'green' : undefined}
						>
							{index === selectedModelIndex ? '> ' : '  '}
							{model.model} ({model.provider})
						</Text>
					))
				) : (
					<Text color="yellow">No models available</Text>
				)}
			</Box>
			{message && <Text color="cyan">{message}</Text>}
		</BaseStep>
	);
}
