import React, {useState} from 'react';
import Wizard from './Wizard/Wizard.js';
import {
	WelcomeStep,
	ConfirmationStep,
	CompletionStep,
} from './Wizard/Steps/index.js';
import {deleteConfig, configExists} from '../utils/config.js';

type RemoveConfigProps = {
	onComplete: () => void;
};

// Step IDs
const STEPS = {
	WELCOME: 'welcome',
	CONFIRM: 'confirm',
	COMPLETION: 'completion',
};

export default function RemoveConfig({onComplete}: RemoveConfigProps) {
	const [configRemoved, setConfigRemoved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleRemoveConfig = () => {
		try {
			// Check if config exists
			if (!configExists()) {
				setError('No configuration file found.');
				return;
			}

			// Delete the config
			const success = deleteConfig(true);

			if (success) {
				setConfigRemoved(true);
			} else {
				setError('Failed to remove configuration.');
			}
		} catch (err) {
			setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	return (
		<Wizard
			steps={[
				{
					id: STEPS.WELCOME,
					component: (
						<WelcomeStep
							title="Remove Configuration"
							message="This will remove all your Omni CLI configuration, including API keys and default model settings."
						/>
					),
				},
				{
					id: STEPS.CONFIRM,
					component: (
						<ConfirmationStep
							title="Confirm Removal"
							message="Are you sure you want to remove all configuration? This action cannot be undone."
							confirmText="Yes, remove config"
							cancelText="No, keep config"
							onConfirm={handleRemoveConfig}
							dangerConfirm={true}
						/>
					),
				},
				{
					id: STEPS.COMPLETION,
					component: (
						<CompletionStep
							title={
								configRemoved ? 'Configuration Removed' : 'Operation Failed'
							}
							message={
								error
									? `An error occurred: ${error}`
									: configRemoved
									? 'Your configuration has been successfully removed.'
									: 'No changes were made to your configuration.'
							}
							showCompleteButton={true}
						/>
					),
				},
			]}
			initialStepId={STEPS.WELCOME}
			onComplete={onComplete}
		/>
	);
}
