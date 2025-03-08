import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '@/hooks/useWizard.js';
import {readConfig, updateConfig} from '@/utils/config.js';

export interface ProviderSelectionStepProps {
	nextStepId?: string;
	onSelect?: (selectedProviders: string[]) => void;
}

export default function ProviderSelectionStep({
	nextStepId,
	onSelect,
}: ProviderSelectionStepProps) {
	const {goToNextStep, goToStep, cancelWizard} = useWizard();
	const [providers, setProviders] = useState<
		{id: string; name: string; enabled: boolean}[]
	>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [message, setMessage] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	// Load providers from config
	useEffect(() => {
		const config = readConfig();
		const providerList = Object.entries(config.providers).map(([id, data]) => ({
			id,
			name: id.charAt(0).toUpperCase() + id.slice(1),
			enabled: data.enabled || false,
		}));
		setProviders(providerList);
	}, []);

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
			setError(null);
		} else if (key.downArrow) {
			setSelectedIndex(prev => (prev < providers.length - 1 ? prev + 1 : prev));
			setError(null);
		} else if (key.return) {
			// Enter key now acts as the continue button
			const enabledProviders = providers.filter(p => p.enabled);

			if (enabledProviders.length === 0) {
				setError('Please select at least one provider before continuing.');
				return;
			}

			// Save selected providers
			const config = readConfig();
			providers.forEach(provider => {
				const providerConfig = config.providers[provider.id];
				if (providerConfig) {
					providerConfig.enabled = provider.enabled;
				}
			});
			updateConfig(config);

			// Call the onSelect callback if provided
			if (onSelect) {
				const selectedProviders = providers
					.filter(p => p.enabled)
					.map(p => p.id);
				onSelect(selectedProviders);
			}

			setMessage('Provider preferences saved!');

			// Navigate to the next step after a delay
			setTimeout(() => {
				setMessage('');
				if (nextStepId) {
					goToStep(nextStepId);
				} else {
					goToNextStep();
				}
			}, 1500);
		} else if (key.escape) {
			// Escape key to exit
			cancelWizard();
		} else if (_input === ' ' && selectedIndex < providers.length) {
			// Space to select/deselect the provider
			setProviders(prev =>
				prev.map((provider, index) =>
					index === selectedIndex
						? {...provider, enabled: !provider.enabled}
						: provider,
				),
			);
			setError(null);
		}
	});

	return (
		<BaseStep
			title="Provider Selection"
			footer={
				<Text>
					<Text color="yellow">↑/↓</Text> to navigate,{' '}
					<Text color="yellow">Space</Text> to select,{' '}
					<Text color="green">Enter</Text> to continue, and{' '}
					<Text color="red">Esc</Text> to exit
				</Text>
			}
		>
			<Text>Select which providers you want to configure:</Text>
			<Box flexDirection="column" marginY={1}>
				{providers.map((provider, index) => (
					<Text
						key={provider.id}
						color={index === selectedIndex ? 'green' : undefined}
					>
						{index === selectedIndex ? '> ' : '  '}[
						{provider.enabled ? 'x' : ' '}] {provider.name}
					</Text>
				))}
			</Box>
			{message && <Text color="cyan">{message}</Text>}
			{error && <Text color="red">{error}</Text>}
		</BaseStep>
	);
}
