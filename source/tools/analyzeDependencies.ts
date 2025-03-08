import {tool} from 'ai';
import path from 'path';
import {z} from 'zod';
import fs from 'fs';
export const analyzeDependencies = tool({
	description:
		'Analyze package.json to extract project information and dependencies',
	parameters: z.object({
		path: z
			.string()
			.optional()
			.describe('Path to package.json (default: ./package.json)'),
	}),
	execute: async ({path: packagePath = './package.json'}) => {
		try {
			const fullPath = path.resolve(process.cwd(), packagePath);

			if (!fs.existsSync(fullPath)) {
				return 'No package.json found at the specified path.';
			}

			const content = await fs.promises.readFile(fullPath, 'utf8');
			const packageJson = JSON.parse(content);

			const {
				name,
				version,
				description,
				main,
				scripts,
				dependencies,
				devDependencies,
				author,
				license,
			} = packageJson;

			let result = `Project: ${name || 'Unnamed'} ${
				version ? `(v${version})` : ''
			}\n`;

			if (description) {
				result += `Description: ${description}\n`;
			}

			if (main) {
				result += `Main entry point: ${main}\n`;
			}

			if (scripts && Object.keys(scripts).length > 0) {
				result += `\nAvailable scripts:\n`;
				for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
					result += `  - ${scriptName}: ${scriptCommand}\n`;
				}
			}

			if (dependencies && Object.keys(dependencies).length > 0) {
				result += `\nDependencies (${Object.keys(dependencies).length}):\n`;
				for (const [dep, version] of Object.entries(dependencies)) {
					result += `  - ${dep}: ${version}\n`;
				}
			}

			if (devDependencies && Object.keys(devDependencies).length > 0) {
				result += `\nDev Dependencies (${
					Object.keys(devDependencies).length
				}):\n`;
				for (const [dep, version] of Object.entries(devDependencies).slice(
					0,
					10,
				)) {
					result += `  - ${dep}: ${version}\n`;
				}

				if (Object.keys(devDependencies).length > 10) {
					result += `  - ... and ${
						Object.keys(devDependencies).length - 10
					} more\n`;
				}
			}

			if (author) {
				result += `\nAuthor: ${
					typeof author === 'string' ? author : JSON.stringify(author)
				}\n`;
			}

			if (license) {
				result += `License: ${license}\n`;
			}

			return result;
		} catch (error: any) {
			return `Error analyzing package.json: ${error.message}`;
		}
	},
});
