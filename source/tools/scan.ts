import {tool} from 'ai';
import path from 'path';
import {glob} from 'glob';
import {z} from 'zod';

export const scan = tool({
	description: 'Scan the project to list files with optional filtering',
	parameters: z.object({
		directory: z
			.string()
			.optional()
			.describe('Directory to scan (default: current directory)'),
		pattern: z
			.string()
			.optional()
			.describe('Glob pattern to filter files (default: **/**)'),
		ignore: z
			.array(z.string())
			.optional()
			.describe('Patterns to ignore (e.g., node_modules)'),
		maxDepth: z
			.number()
			.optional()
			.describe('Maximum directory depth to traverse'),
	}),
	execute: async ({
		directory = '.',
		pattern = '**/*',
		ignore = [],
		maxDepth = 5,
	}) => {
		const ignorePatterns = [
			'**/node_modules/**',
			'**/dist/**',
			'**/build/**',
			'**/.git/**',
		].concat(ignore);

		try {
			const options = {
				cwd: path.resolve(process.cwd(), directory),
				ignore: ignorePatterns,
				dot: false,
				nodir: true,
				maxDepth,
			};

			const files = glob.sync(pattern, options);

			if (files.length === 0) {
				return 'No files found matching the criteria.';
			}

			// Group files by directory for better readability
			const filesByDir = {} as Record<string, string[]>;

			files.forEach(file => {
				const dir = path.dirname(file);
				if (!filesByDir[dir]) {
					filesByDir[dir] = [];
				}
				filesByDir[dir].push(path.basename(file));
			});

			// Format the output
			let result = `Found ${files.length} files:\n\n`;
			for (const [dir, dirFiles] of Object.entries(filesByDir)) {
				result += `${dir}/\n`;
				dirFiles.forEach(file => {
					result += `  ${file}\n`;
				});
				result += '\n';
			}

			return result;
		} catch (error: any) {
			return `Error scanning files: ${error.message}`;
		}
	},
});
