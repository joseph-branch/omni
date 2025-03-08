import React from 'react';
import {Text, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '@/hooks/useWizard.js';

export interface CompletionStepProps {
	title?: string;
	message?: string;
	nextStepId?: string;
	showCompleteButton?: boolean;
}

export default function CompletionStep({
	title = 'Setup Complete!',
	message = 'Your Omni CLI is now configured and ready to use.',
	nextStepId,
	showCompleteButton = true,
}: CompletionStepProps) {
	const {goToNextStep, goToStep, completeWizard} = useWizard();

	useInput((_input, key) => {
		if (key.return) {
			if (nextStepId) {
				goToStep(nextStepId);
			} else if (showCompleteButton) {
				completeWizard();
			} else {
				goToNextStep();
			}
		}
	});

	return (
		<BaseStep
			title={title}
			footer={
				showCompleteButton ? (
					<Text>
						Press <Text color="green">Enter</Text> to continue.
					</Text>
				) : (
					<Text>
						Press <Text color="green">Enter</Text> to proceed to the next step.
					</Text>
				)
			}
		>
			<Text>{message}</Text>
			<Text>You can change these settings anytime by running:</Text>
			<Text color="yellow">omni config</Text>
		</BaseStep>
	);
}
