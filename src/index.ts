import * as core from "@actions/core";
import * as fs from "fs";
import simpleGit from "simple-git";
import { parseGitmodules } from "./GitmodulesParser";

/** Regex for matching remote urls
 *
 * Groups:
 * 1. Protocol (`https://` or `git@`)
 * 2. Host (like `github.com` or `gitlab.com`)
 * 3. Remote project path (like `USER/REPO.git` or `GROUP/SUBGROUP/REPO.git`)
 */
const REMOTE_REGEX = /(https:\/\/|git@)([A-z0-9_.-]+)[\/:](.+)/;

async function run() {
  const git = simpleGit();

  const gitDepth = core.getInput("depth");

  console.log("Getting remotes for submodules...");
  const gitmodules = parseGitmodules(
    await fs.promises.readFile(".gitmodules", "utf-8")
  );

  for (const gitmodule of gitmodules) {
    const path = gitmodule.path;
    const url = gitmodule.url;

    const urlMatch = REMOTE_REGEX.exec(url);
    if (!urlMatch) throw new Error(`Failed to parse url segments for ${path}`);

    const protocol = urlMatch[1];
    const host = urlMatch[2];
    const remotePath = urlMatch[3];

    if (!protocol) throw new Error(`Protocol could not be parsed for ${path}`);
    if (!host) throw new Error(`Remote host could not be parsed for ${path}`);
    if (!remotePath)
      throw new Error(`Url path could not be parsed for ${path}`);

    if (protocol === "git@") {
      console.log(`Converting SSH remote for ${path} to HTTPS`);
      const newRemoteURL = `https://${host}/${remotePath}`;
      await git.subModule(["set-url", path, newRemoteURL]);
    }
  }

  await git.subModule(["sync"]);

  console.log("Initializing submodules...");

  const args = ["--init"];
  if (gitDepth) args.push(`--depth ${gitDepth}`);

  await git.submoduleUpdate(args);
}

run();
