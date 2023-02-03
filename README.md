# get-submodules-action
Allows you to get all of your submodules in a GitHub workflow - including those that have GitLab remotes. I have not tested with other remotes but it should work, as this action relies primarly on Git.

The action will first read your `.submodules` file, converting any SSH remote URLs to HTTP urls. It will then initialize all the submodules so you can run any further tests on them.

# Example of GitHub workflow
First, we have to get the zip file from the latest release. Then we have to unzip it so it can be executed.

```yml
name: Main

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # Checkout current repo
      - uses: actions/checkout@v3
        name: Checkout repo
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      # Fetch release ZIP
      - uses: dsaltares/fetch-gh-release-asset@1.1.0
        name: Get submodule fetching action
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          repo: carsakiller/get-submodules-action
          file: dist.zip
          target: submodule-action.zip
      
      # Unzip action
      - name: Unzip submodule fetching action
        run: unzip submodule-action.zip -d submodule-action
  
      # Get all submodules
      - uses: ./submodule-action/dist
        name: Get all submodules

      - run: ls submodules
```
