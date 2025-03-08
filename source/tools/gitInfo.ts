import { tool } from "ai";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export const gitInfo = tool({
  description: "Get information about the Git repository",
  parameters: z.object({
    command: z
      .enum(["status", "log", "branch", "remote", "summary"])
      .describe("The Git command to run"),
    limit: z
      .number()
      .optional()
      .describe("Limit the number of results (for log)"),
  }),
  execute: async ({ command, limit = 5 }) => {
    try {
      let gitCommand;

      switch (command) {
        case "status":
          gitCommand = "git status -s";
          break;
        case "log":
          gitCommand = `git log --oneline --decorate --graph -n ${limit}`;
          break;
        case "branch":
          gitCommand = "git branch -v";
          break;
        case "remote":
          gitCommand = "git remote -v";
          break;
        case "summary":
          gitCommand = "git shortlog -sn --no-merges";
          break;
        default:
          return "Invalid Git command.";
      }

      const { stdout, stderr } = await execPromise(gitCommand);

      if (stderr) {
        return `Git warning/error: ${stderr}\nOutput: ${stdout || "No output"}`;
      }

      if (!stdout.trim()) {
        return "No output from Git command.";
      }

      return stdout;
    } catch (error: any) {
      return `Error executing Git command: ${error.message}`;
    }
  },
});
