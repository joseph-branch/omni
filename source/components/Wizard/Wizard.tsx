import React, {useState, ReactNode, useEffect} from 'react';
import {Box} from 'ink';

export type StepId = string;

export interface WizardStep {
	id: StepId;
	component: ReactNode;
}

export interface WizardContextType {
	goToStep: (stepId: StepId) => void;
	goToNextStep: () => void;
	goToPreviousStep: () => void;
	currentStepId: StepId;
	isFirstStep: boolean;
	isLastStep: boolean;
	completeWizard: () => void;
	cancelWizard: () => void;
}

export const WizardContext = React.createContext<WizardContextType | undefined>(
	undefined,
);

export interface WizardProps {
	steps: WizardStep[];
	initialStepId?: StepId;
	onComplete?: () => void;
	onCancel?: () => void;
	onStepChange?: (stepId: StepId) => void;
	children?: ReactNode;
}

export default function Wizard({
	steps,
	initialStepId,
	onComplete,
	onCancel,
	onStepChange,
	children,
}: WizardProps) {
	const defaultStepId = steps.length > 0 ? steps[0]?.id || '' : '';
	const [currentStepId, setCurrentStepId] = useState<StepId>(
		initialStepId || defaultStepId,
	);

	// Find the current step index
	const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

	// Determine if we're on the first or last step
	const isFirstStep = currentStepIndex === 0;
	const isLastStep = currentStepIndex === steps.length - 1;

	// Call onStepChange when the current step changes
	useEffect(() => {
		if (onStepChange && currentStepId) {
			onStepChange(currentStepId);
		}
	}, [currentStepId, onStepChange]);

	// Navigation functions
	const goToStep = (stepId: StepId) => {
		const stepExists = steps.some(step => step.id === stepId);
		if (stepExists) {
			setCurrentStepId(stepId);
		}
	};

	const goToNextStep = () => {
		if (
			!isLastStep &&
			currentStepIndex >= 0 &&
			currentStepIndex < steps.length - 1
		) {
			const nextStep = steps[currentStepIndex + 1];
			if (nextStep) {
				setCurrentStepId(nextStep.id);
			}
		}
	};

	const goToPreviousStep = () => {
		if (!isFirstStep && currentStepIndex > 0) {
			const prevStep = steps[currentStepIndex - 1];
			if (prevStep) {
				setCurrentStepId(prevStep.id);
			}
		}
	};

	const completeWizard = () => {
		if (onComplete) {
			onComplete();
		}
	};

	const cancelWizard = () => {
		if (onCancel) {
			onCancel();
		}
	};

	// Create the context value
	const contextValue: WizardContextType = {
		goToStep,
		goToNextStep,
		goToPreviousStep,
		currentStepId,
		isFirstStep,
		isLastStep,
		completeWizard,
		cancelWizard,
	};

	// Find the current step component
	const currentStep = steps.find(step => step.id === currentStepId);

	return (
		<WizardContext.Provider value={contextValue}>
			<Box flexDirection="column" paddingX={0} marginX={0}>
				{currentStep ? currentStep.component : children}
			</Box>
		</WizardContext.Provider>
	);
}
