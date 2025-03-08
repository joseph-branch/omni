import {tool} from 'ai';
import {z} from 'zod';
import fs from 'fs';
import path from 'path';

export const remove = tool({
	description: 'Delete a file or directory',
	parameters: z.object({
		path: z.string().describe('The path to the file or directory to delete'),
		recursive: z
			.boolean()
			.optional()
			.describe('Delete directories recursively (default: false)'),
	}),
	execute: async ({path: filePath, recursive = false}) => {
		try {
			const fullPath = path.resolve(process.cwd(), filePath);
			const stats = await fs.promises.stat(fullPath);

			if (stats.isDirectory()) {
				if (recursive) {
					await fs.promises.rm(fullPath, {recursive: true, force: true});
					return `Directory ${filePath} deleted recursively`;
				} else {
					await fs.promises.rmdir(fullPath);
					return `Directory ${filePath} deleted`;
				}
			} else {
				await fs.promises.unlink(fullPath);
				return `File ${filePath} deleted`;
			}
		} catch (error: any) {
			return `Error deleting path: ${error.message}`;
		}
	},
});
