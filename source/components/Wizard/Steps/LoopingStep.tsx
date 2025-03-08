import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '../../../hooks/useWizard.js';

export interface LoopingStepProps {
	title?: string;
	message?: string;
	nextStepId?: string;
	loopBackStepId?: string;
	completeStepId?: string;
}

export default function LoopingStep({
	title = 'Looping Step',
	message = 'This step demonstrates how to create a looping wizard.',
	nextStepId,
	loopBackStepId,
	completeStepId,
}: LoopingStepProps) {
	const {goToNextStep, goToStep} = useWizard();
	const [selectedOption, setSelectedOption] = useState<
		'next' | 'loop' | 'complete'
	>('next');

	useInput((_input, key) => {
		if (key.upArrow || key.downArrow) {
			setSelectedOption(prev => {
				if (prev === 'next') return 'loop';
				if (prev === 'loop') return completeStepId ? 'complete' : 'next';
				return 'next';
			});
		} else if (key.return) {
			if (selectedOption === 'next') {
				if (nextStepId) {
					goToStep(nextStepId);
				} else {
					goToNextStep();
				}
			} else if (selectedOption === 'loop' && loopBackStepId) {
				goToStep(loopBackStepId);
			} else if (selectedOption === 'complete' && completeStepId) {
				goToStep(completeStepId);
			}
		}
	});

	return (
		<BaseStep
			title={title}
			footer={
				<Text>
					Use <Text color="yellow">↑/↓</Text> to navigate and{' '}
					<Text color="green">Enter</Text> to select.
				</Text>
			}
		>
			<Text>{message}</Text>
			<Box flexDirection="column" marginY={1}>
				<Text color={selectedOption === 'next' ? 'green' : undefined}>
					{selectedOption === 'next' ? '> ' : '  '}
					Continue to next step
				</Text>
				{loopBackStepId && (
					<Text color={selectedOption === 'loop' ? 'green' : undefined}>
						{selectedOption === 'loop' ? '> ' : '  '}
						Loop back to previous step
					</Text>
				)}
				{completeStepId && (
					<Text color={selectedOption === 'complete' ? 'green' : undefined}>
						{selectedOption === 'complete' ? '> ' : '  '}
						Complete the wizard
					</Text>
				)}
			</Box>
		</BaseStep>
	);
}
