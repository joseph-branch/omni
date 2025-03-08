import React, {ReactNode} from 'react';
import {Box, Text} from 'ink';
import {useWizard} from '../../../hooks/useWizard.js';

export interface BaseStepProps {
	title: string;
	children: ReactNode;
	footer?: ReactNode;
}

export default function BaseStep({title, children, footer}: BaseStepProps) {
	useWizard();

	return (
		<Box flexDirection="column" marginTop={1}>
			<Box>
				<Text bold>{title}</Text>
			</Box>

			<Box flexDirection="column" marginY={1}>
				{children}
			</Box>

			{footer && <Box marginTop={0}>{footer}</Box>}
		</Box>
	);
}
