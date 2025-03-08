import { tool } from "ai";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export const grep = tool({
  description: "Search file contents using regex patterns",
  parameters: z.object({
    pattern: z.string().describe("The regex pattern to search for"),
    path: z.string().describe("File or directory to search in"),
    recursive: z
      .boolean()
      .optional()
      .describe("Search recursively in directories (default: false)"),
  }),
  execute: async ({ pattern, path: searchPath, recursive = false }) => {
    try {
      const recursiveFlag = recursive ? "-r" : "";
      const { stdout, stderr } = await execPromise(
        `grep ${recursiveFlag} -n "${pattern}" ${searchPath}`
      );

      if (stderr) {
        return `Warning during search:\n${stderr}\nResults:\n${stdout}`;
      }

      if (!stdout) {
        return "No matches found.";
      }

      return stdout;
    } catch (error: any) {
      if (error.code === 1) {
        return "No matches found.";
      }
      return `Error during search: ${error.message}`;
    }
  },
});
