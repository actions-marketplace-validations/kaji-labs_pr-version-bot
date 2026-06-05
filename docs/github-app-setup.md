# GitHub App Setup

If your repository has branch protection rules, direct pushes from `GITHUB_TOKEN` are blocked — including pushes from GitHub Actions. A GitHub App token bypasses this when the app is added to the ruleset bypass list, letting the action commit the release files directly to your main branch without a separate release PR.

## Why a GitHub App?

- Bypass actors in GitHub rulesets are App-based — `GITHUB_TOKEN` cannot be added directly at the repository level
- The private key does not expire — no rotation burden
- Permissions are scoped to exactly what the action needs (`contents: write`)

## Setup

### 1. Create a GitHub App

Go to your account or organisation settings:

- **Personal:** `github.com/settings/apps/new`
- **Organisation:** `github.com/organizations/<org>/settings/apps/new`

Fill in:

| Field                | Value                                  |
| -------------------- | -------------------------------------- |
| **GitHub App name**  | Any unique name, e.g. `my-release-bot` |
| **Homepage URL**     | Your repo URL                          |
| **Webhook → Active** | Uncheck (not needed)                   |

Under **Repository permissions**:

| Permission      | Access         |
| --------------- | -------------- |
| Contents        | Read and write |
| Everything else | No access      |

Under **Where can this GitHub App be installed**, select **"Any account"** if you want to reuse the app across multiple repos or orgs.

Click **"Create GitHub App"**.

### 2. Note the App ID

On the app's settings page, copy the **App ID** shown near the top.

### 3. Generate a private key

Scroll to the bottom of the app settings page and click **"Generate a private key"**. A `.pem` file downloads automatically.

### 4. Install the app on your repository

In the app settings sidebar, click **"Install App"** → **"Install"** next to your account or org → select the repositories you want → click **"Install"**.

### 5. Add the app as a bypass actor

Go to your repo → **Settings → Rules → Rulesets** → edit your ruleset → **Bypass list** → **Add bypass** → switch type to **App** → search for your app name → select it → save.

This allows the app to push directly to protected branches.

### 6. Add secrets to your repository

Go to your repo → **Settings → Secrets and variables → Actions**.

Add:

| Type   | Name              | Value                                        |
| ------ | ----------------- | -------------------------------------------- |
| Secret | `APP_ID`          | The App ID number from step 2                |
| Secret | `APP_PRIVATE_KEY` | Full contents of the `.pem` file from step 3 |

### 7. Update your workflow

Add a token generation step before checkout and pass the token to the action:

```yaml
permissions:
  contents: write

steps:
  - name: Generate app token
    id: app-token
    uses: actions/create-github-app-token@v3
    with:
      app-id: ${{ secrets.APP_ID }}
      private-key: ${{ secrets.APP_PRIVATE_KEY }}

  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
      token: ${{ steps.app-token.outputs.token }}

  - uses: kaji-labs/pr-version-bot@v1
    with:
      github-token: ${{ steps.app-token.outputs.token }}
```

See [`examples/with-branch-protection.yml`](../examples/with-branch-protection.yml) for a complete workflow.

## Using release PR mode instead

If you prefer the action to open a pull request for each release (so you can review before merging to main), add `use-release-pr: 'true'` and grant `pull-requests: write` to the app. PRs opened with an App token trigger CI normally, so branch protection checks will pass.

See [troubleshooting — CI not running on release PR](troubleshooting.md#ci-not-running-on-release-pr) for more detail.
