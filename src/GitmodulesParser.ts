/** Matches all text between submodule definitions */
const DEFINTION_REGEX = /\[[^[]+/gm;
const PATH_REGEX = /path = (.*)/;
const URL_REGEX = /url = (.*)/;

export const parseGitmodules = (contents: string) => {
  const submodules = [];

  for (const matches of contents.matchAll(DEFINTION_REGEX)) {
    const definition = matches[0];

    const pathMatch = PATH_REGEX.exec(definition);
    if (!pathMatch || !pathMatch[1])
      throw new Error("Failed to parse submodule path");
    const path = pathMatch[1];

    const urlMatch = URL_REGEX.exec(definition);
    if (!urlMatch || !urlMatch[1])
      throw new Error("Failed to parse submodule url");
    const url = urlMatch[1];

    submodules.push({ path, url });
  }

  return submodules;
};
