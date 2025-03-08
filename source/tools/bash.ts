import {tool} from 'ai';
import {exec} from 'child_process';
import {promisify} from 'util';
import {z} from 'zod';

const execPromise = promisify(exec);

// Define the executeBash function first
const executeBash = async (command: string) => {
	try {
		const {stdout, stderr} = await execPromise(command);

		if (stderr) {
			return `Command executed with warnings:\n${stderr}\nOutput:\n${stdout}`;
		}
		return stdout || 'Command executed successfully (no output)';
	} catch (error: any) {
		return `Error executing command: ${error.message}`;
	}
};

// Create a serializable wrapper for the bash tool

export const bash = tool({
	description: 'Execute shell commands and get the output',
	parameters: z.object({
		command: z.string().describe('The shell command to execute'),
	}),
	execute: async ({command}) => {
		// Create a new wrapper each time with the current command

		return executeBash(command);
	},
});
