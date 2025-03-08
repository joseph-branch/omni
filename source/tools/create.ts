import path from "path";
import { tool } from "ai";
import { z } from "zod";
import fs from "fs";
import chalk from "chalk";

export const create = tool({
  description: "Create a new file or directory",
  parameters: z.object({
    path: z.string().describe("The path for the new file or directory"),
    content: z
      .string()
      .optional()
      .describe("The content for the file (if creating a file)"),
    isDirectory: z
      .boolean()
      .optional()
      .describe("Whether to create a directory (default: false)"),
    encoding: z
      .string()
      .optional()
      .describe("The file encoding (default: utf-8)"),
  }),
  execute: async ({
    path: filePath,
    content = "",
    isDirectory = false,
    encoding = "utf-8",
  }) => {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      const dirPath = isDirectory ? fullPath : path.dirname(fullPath);

      // Create directory if it doesn't exist
      await fs.promises.mkdir(dirPath, { recursive: true });

      if (!isDirectory) {
        // For new files, just show the content with green highlighting
        await fs.promises.writeFile(fullPath, content, {
          encoding: encoding as BufferEncoding,
        });
        
        // Format the content with green for new content
        const formattedContent = content
          .split('\n')
          .map(line => chalk.green(`+ ${line}`))
          .join('\n');
        
        return `File created successfully at ${filePath}\n\nNew content:\n${formattedContent}`;
      }

      return `Directory created successfully at ${filePath}`;
    } catch (error: any) {
      return `Error creating ${isDirectory ? "directory" : "file"}: ${
        error.message
      }`;
    }
  },
});
