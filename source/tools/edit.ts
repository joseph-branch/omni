import {tool} from 'ai';
import {z} from 'zod';
import fs from 'fs';

export const edit = tool({
	description: 'Make targeted changes to a file by replacing specific text',
	parameters: z.object({
		path: z.string().describe('The path to the file to edit'),
		search: z.string().describe('The text or regex pattern to search for'),
		replace: z.string().describe('The text to replace the matches with'),
		regex: z
			.boolean()
			.optional()
			.describe('Treat search as regex (default: false)'),
		encoding: z
			.string()
			.optional()
			.describe('The file encoding (default: utf-8)'),
	}),
	execute: async ({
		path: filePath,
		search,
		replace,
		regex = false,
		encoding = 'utf-8',
	}) => {
		try {
			const content = await fs.promises.readFile(filePath, {
				encoding: encoding as BufferEncoding,
			});

			let newContent;
			if (regex) {
				const searchRegex = new RegExp(search, 'g');
				newContent = content.replace(searchRegex, replace);
			} else {
				newContent = content.split(search).join(replace);
			}

			if (content === newContent) {
				return 'No changes were made (search text not found).';
			}

			// Write the changes to the file
			await fs.promises.writeFile(filePath, newContent, {
				encoding: encoding as BufferEncoding,
			});

			// Return success message with the diff
			return `File updated successfully.`;
		} catch (error: any) {
			return `Error editing file: ${error.message}`;
		}
	},
});
