import React, {useState, useEffect} from 'react';
import Wizard from './Wizard/Wizard.js';
import {
	WelcomeStep,
	ApiKeyStep,
	ModelSelectionStep,
	CompletionStep,
	ProviderSelectionStep,
	ConfirmationStep,
} from './Wizard/Steps/index.js';
import {
	configExists,
	getCurrentInitializationStep,
	getSelectedProviders,
	updateInitializationState,
	resetInitializationState,
	deleteConfig,
} from '../utils/config.js';

type InitializeProps = {
	onComplete: () => void;
	onCancel: () => void;
};

// Step IDs
const STEPS = {
	WELCOME: 'welcome',
	PROVIDER_SELECTION: 'provider_selection',
	OPENAI_API_KEY: 'openai_api_key',
	ANTHROPIC_API_KEY: 'anthropic_api_key',
	MISTRAL_API_KEY: 'mistral_api_key',
	MODEL_SELECTION: 'model_selection',
	RESET_CONFIRM: 'reset_confirm',
	COMPLETION: 'completion',
};

export default function Initialize({onComplete, onCancel}: InitializeProps) {
	const [selectedProviders, setSelectedProviders] = useState<string[]>([
		'openai',
	]);
	const [initialStepId, setInitialStepId] = useState<string>(STEPS.WELCOME);
	const [showResetOption, setShowResetOption] = useState(false);

	// Check if we should resume from a saved state
	useEffect(() => {
		if (configExists()) {
			const currentStep = getCurrentInitializationStep();
			const savedProviders = getSelectedProviders();

			if (currentStep && currentStep !== STEPS.WELCOME) {
				setInitialStepId(currentStep);
				setShowResetOption(true);
			}

			if (savedProviders && savedProviders.length > 0) {
				setSelectedProviders(savedProviders);
			}
		}
	}, []);

	// Handle step change
	const handleStepChange = (stepId: string) => {
		updateInitializationState(
			stepId,
			stepId === STEPS.COMPLETION,
			selectedProviders,
		);
	};

	// Handle provider selection
	const handleProviderSelection = (providers: string[]) => {
		setSelectedProviders(providers);
		updateInitializationState(STEPS.PROVIDER_SELECTION, false, providers);
	};

	// Handle reset confirmation
	const handleReset = () => {
		resetInitializationState();
		setInitialStepId(STEPS.WELCOME);
		setShowResetOption(false);
	};

	// Handle cancellation
	const handleCancel = () => {
		// Delete the config file if the user cancels
		deleteConfig(true);
		onCancel();
	};

	// Generate steps based on selected providers
	const getSteps = () => {
		const steps = [
			{
				id: STEPS.WELCOME,
				component: (
					<WelcomeStep
						title="Welcome to Omni CLI!"
						message={
							showResetOption
								? 'It looks like you were in the middle of setting up. You can continue where you left off or reset the setup process.'
								: "This is the first-time setup wizard. We'll help you configure your API keys and default model."
						}
						nextStepId={
							showResetOption ? STEPS.RESET_CONFIRM : STEPS.PROVIDER_SELECTION
						}
					/>
				),
			},
		];

		// Add reset confirmation step if needed
		if (showResetOption) {
			steps.push({
				id: STEPS.RESET_CONFIRM,
				component: (
					<ConfirmationStep
						title="Reset Setup"
						message="Would you like to reset the setup process and start over?"
						confirmText="Yes, start over"
						cancelText="No, continue where I left off"
						onConfirm={handleReset}
						nextStepId={STEPS.PROVIDER_SELECTION}
					/>
				),
			});
		}

		// Add provider selection step
		steps.push({
			id: STEPS.PROVIDER_SELECTION,
			component: <ProviderSelectionStep onSelect={handleProviderSelection} />,
		});

		// Add API key steps for selected providers
		if (selectedProviders.includes('openai')) {
			steps.push({
				id: STEPS.OPENAI_API_KEY,
				component: <ApiKeyStep provider="openai" />,
			});
		}

		if (selectedProviders.includes('anthropic')) {
			steps.push({
				id: STEPS.ANTHROPIC_API_KEY,
				component: <ApiKeyStep provider="anthropic" />,
			});
		}

		if (selectedProviders.includes('mistral')) {
			steps.push({
				id: STEPS.MISTRAL_API_KEY,
				component: <ApiKeyStep provider="mistral" />,
			});
		}

		// Add model selection and completion steps
		steps.push(
			{
				id: STEPS.MODEL_SELECTION,
				component: <ModelSelectionStep nextStepId={STEPS.COMPLETION} />,
			},
			{
				id: STEPS.COMPLETION,
				component: (
					<CompletionStep
						title="Setup Complete!"
						message="Your Omni CLI is now configured and ready to use."
						showCompleteButton={true}
					/>
				),
			},
		);

		return steps;
	};

	return (
		<Wizard
			steps={getSteps()}
			initialStepId={initialStepId}
			onComplete={onComplete}
			onCancel={handleCancel}
			onStepChange={handleStepChange}
		/>
	);
}
