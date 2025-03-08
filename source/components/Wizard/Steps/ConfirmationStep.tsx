import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import BaseStep from './BaseStep.js';
import {useWizard} from '../../../hooks/useWizard.js';

export interface ConfirmationStepProps {
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
	confirmStepId?: string;
	cancelStepId?: string;
	nextStepId?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
	dangerConfirm?: boolean;
}

export default function ConfirmationStep({
	title = 'Confirmation',
	message = 'Are you sure you want to proceed?',
	confirmText = 'Yes',
	cancelText = 'No',
	confirmStepId,
	cancelStepId,
	nextStepId,
	onConfirm,
	onCancel,
	dangerConfirm = false,
}: ConfirmationStepProps) {
	const {goToStep, completeWizard} = useWizard();
	const [selectedOption, setSelectedOption] = useState<'confirm' | 'cancel'>(
		'cancel',
	);

	useInput((_input, key) => {
		if (key.leftArrow || key.rightArrow) {
			setSelectedOption(prev => (prev === 'confirm' ? 'cancel' : 'confirm'));
		} else if (key.return) {
			if (selectedOption === 'confirm') {
				if (onConfirm) {
					onConfirm();
				}

				if (confirmStepId) {
					goToStep(confirmStepId);
				} else if (nextStepId) {
					goToStep(nextStepId);
				} else {
					completeWizard();
				}
			} else {
				if (onCancel) {
					onCancel();
				}

				if (cancelStepId) {
					goToStep(cancelStepId);
				} else if (nextStepId) {
					goToStep(nextStepId);
				} else {
					completeWizard();
				}
			}
		}
	});

	return (
		<BaseStep
			title={title}
			footer={
				<Text>
					Use <Text color="yellow">←/→</Text> to navigate and{' '}
					<Text color="green">Enter</Text> to select.
				</Text>
			}
		>
			<Text>{message}</Text>
			<Box marginY={1}>
				<Box marginRight={2}>
					<Text
						color={
							selectedOption === 'confirm'
								? dangerConfirm
									? 'red'
									: 'green'
								: undefined
						}
						bold={selectedOption === 'confirm'}
					>
						{selectedOption === 'confirm' ? '> ' : '  '}
						{confirmText}
					</Text>
				</Box>
				<Box>
					<Text
						color={selectedOption === 'cancel' ? 'blue' : undefined}
						bold={selectedOption === 'cancel'}
					>
						{selectedOption === 'cancel' ? '> ' : '  '}
						{cancelText}
					</Text>
				</Box>
			</Box>
		</BaseStep>
	);
}
