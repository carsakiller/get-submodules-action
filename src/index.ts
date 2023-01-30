import * as core from "@actions/core";
import simpleGit from "simple-git";

/** Regex for matching remote urls
 *
 * Groups:
 * 1. Submodule path
 * 2. Protocol (`https://` or `git@`)
 * 3. Host (like `github.com` or `gitlab.com`)
 * 4. Remote project path (like `USER/REPO.git` or `GROUP/SUBGROUP/REPO.git`)
 */
const remoteRegex =
  /Entering '([^']+)'\n(https:\/\/|git@)([A-z0-9_.-]+)[\/:](.+)/g;

async function run() {
  const git = simpleGit();

  const gitDepth = core.getInput("depth");

  const response = await git.subModule([
    "foreach",
    "git remote get-url origin",
  ]);

  for (const match of response.matchAll(remoteRegex)) {
    const path = match[1];
    const protocol = match[2];
    const host = match[3];
    const remotePath = match[4];

    if (!path)
      throw new Error(`Submodule path could not be parsed for ${match[0]}`);
    if (!protocol)
      throw new Error(`Protocol could not be parsed for ${match[0]}`);
    if (!host)
      throw new Error(`Remote host could not be parsed for ${match[0]}`);
    if (!remotePath)
      throw new Error(`Project path could not be parsed for ${match[0]}`);

    // Convert SSH remotes to HTTP
    if (protocol === "git@") {
      console.log(`Converting SSH remote for ${path} to HTTPS`);
      const newRemoteURL = `https://${host}/${remotePath}`;
      await git.subModule(["set-url", path, newRemoteURL]);
    }
  }

  await git.subModule(["sync"]);

  console.log("Getting submodules");

  const args = ["--init"];
  if (gitDepth) args.push(`--depth ${gitDepth}`);

  await git.submoduleUpdate(args);
}

run();
