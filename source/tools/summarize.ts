import { tool } from "ai";
import { z } from "zod";
import fs from "fs";
import path from "path";

export const summarize = tool({
  description: "Get the content of a file to understand what it contains",
  parameters: z.object({
    file: z.string().describe("The path to the file to summarize"),
  }),
  execute: async ({ file }) => {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      const content = await fs.promises.readFile(fullPath, "utf8");

      return content;
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  },
});
