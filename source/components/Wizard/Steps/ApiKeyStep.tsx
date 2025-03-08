import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '@/hooks/useWizard.js';
import {updateProviderApiKey} from '@/utils/config.js';

export interface ApiKeyStepProps {
	provider: string;
	nextStepId?: string;
	skipStepId?: string;
	onSave?: (provider: string, apiKey: string) => void;
}

export default function ApiKeyStep({
	provider,
	nextStepId,
	skipStepId,
	onSave,
}: ApiKeyStepProps) {
	const {goToNextStep, goToStep} = useWizard();
	const [apiKey, setApiKey] = useState<string>('');
	const [message, setMessage] = useState<string>('');

	useInput((input, key) => {
		if (key.return) {
			if (apiKey.trim()) {
				// Save the API key
				updateProviderApiKey(provider, apiKey);

				// Call the onSave callback if provided
				if (onSave) {
					onSave(provider, apiKey);
				}

				setMessage(`API key for ${provider} saved!`);

				// Navigate to the next step after a delay
				setTimeout(() => {
					setMessage('');
					if (nextStepId) {
						goToStep(nextStepId);
					} else {
						goToNextStep();
					}
				}, 1500);
			} else {
				setMessage('API key cannot be empty!');
				setTimeout(() => setMessage(''), 1500);
			}
		} else if (key.escape || (key.ctrl && input === 'c')) {
			// Skip this step if escape or ctrl+c is pressed
			if (skipStepId) {
				goToStep(skipStepId);
			} else {
				goToNextStep();
			}
		} else if (key.backspace || key.delete) {
			setApiKey(prev => prev.slice(0, -1));
		} else if (input && !key.ctrl && !key.meta && !key.shift) {
			setApiKey(prev => prev + input);
		}
	});

	return (
		<BaseStep
			title={`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
			footer={
				<Text>
					Press <Text color="green">Enter</Text> to save or{' '}
					<Text color="yellow">Esc</Text> to skip.
				</Text>
			}
		>
			<Text>Please enter your {provider} API key:</Text>
			<Box marginY={1} borderStyle="single" paddingX={1}>
				<Text>{apiKey.replace(/./g, '*')}</Text>
			</Box>
			{message && <Text color="cyan">{message}</Text>}
		</BaseStep>
	);
}
