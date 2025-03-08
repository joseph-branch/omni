import React from 'react';
import {Text, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '@/hooks/useWizard.js';

export interface WelcomeStepProps {
	title?: string;
	message?: string;
	nextStepId?: string;
}

export default function WelcomeStep({
	title = 'Welcome to Omni CLI!',
	message = "This is the first-time setup wizard. We'll help you configure your API keys and default model.",
	nextStepId,
}: WelcomeStepProps) {
	const {goToNextStep, goToStep} = useWizard();

	useInput((_input, key) => {
		if (key.return) {
			if (nextStepId) {
				goToStep(nextStepId);
			} else {
				goToNextStep();
			}
		}
	});

	return (
		<BaseStep
			title={title}
			footer={
				<Text>
					Press <Text color="green">Enter</Text> to continue.
				</Text>
			}
		>
			<Text>{message}</Text>
		</BaseStep>
	);
}
