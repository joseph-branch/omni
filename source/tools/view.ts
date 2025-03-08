import { tool } from "ai";
import { z } from "zod";
import fs from "fs";

export const view = tool({
  description:
    "Read and display the contents of a file with optional line selection",
  parameters: z.object({
    path: z.string().describe("The path to the file to view"),
    startLine: z
      .number()
      .optional()
      .describe("Starting line number (default: 1)"),
    endLine: z
      .number()
      .optional()
      .describe("Ending line number (default: all lines)"),
    encoding: z
      .string()
      .optional()
      .describe("The file encoding (default: utf-8)"),
  }),
  execute: async ({
    path: filePath,
    startLine = 1,
    endLine,
    encoding = "utf-8",
  }) => {
    try {
      const content = await fs.promises.readFile(filePath, {
        encoding: encoding as BufferEncoding,
      });
      const lines = content.split("\n");

      // Adjust line numbers to be 0-indexed
      const start = Math.max(0, startLine - 1);
      const end = endLine ? Math.min(lines.length, endLine) : lines.length;

      if (start >= lines.length) {
        return `File has only ${lines.length} lines. Cannot start at line ${startLine}.`;
      }

      const selectedLines = lines.slice(start, end);
      return selectedLines.join("\n");
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  },
});
