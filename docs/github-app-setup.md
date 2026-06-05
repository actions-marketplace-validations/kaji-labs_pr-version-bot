# GitHub App Setup

When `use-release-pr: 'true'` is enabled, the action creates a release PR on your behalf. GitHub intentionally does not trigger CI workflow runs on PRs opened with `GITHUB_TOKEN` (to prevent infinite loops). If your branch protection requires CI checks to pass before merging, you need to use a GitHub App token instead.

## Why a GitHub App?

- PRs opened via a GitHub App token trigger CI normally
- The private key does not expire — no rotation burden
- Permissions are scoped to exactly what the action needs

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
| Pull requests   | Read and write |
| Everything else | No access      |

Under **Where can this GitHub App be installed**, select **"Any account"** if you want to reuse the app across multiple repos or orgs.

Click **"Create GitHub App"**.

### 2. Note the App ID

On the app's settings page, copy the **App ID** shown near the top.

### 3. Generate a private key

Scroll to the bottom of the app settings page and click **"Generate a private key"**. A `.pem` file downloads automatically.

### 4. Install the app on your repository

In the app settings sidebar, click **"Install App"** → **"Install"** next to your account or org → select the repositories you want → click **"Install"**.

### 5. Add secrets to your repository

Go to your repo → **Settings → Secrets and variables → Actions**.

Add:

| Type   | Name              | Value                                        |
| ------ | ----------------- | -------------------------------------------- |
| Secret | `APP_ID`          | The App ID number from step 2                |
| Secret | `APP_PRIVATE_KEY` | Full contents of the `.pem` file from step 3 |

### 6. Update your workflow

Add a token generation step before checkout and pass the token to the action:

```yaml
permissions:
  contents: write
  pull-requests: write

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
      use-release-pr: 'true'
```

See [`examples/with-branch-protection.yml`](../examples/with-branch-protection.yml) for a complete workflow.

## Alternative: bypass actor

If you do not need CI to run on release PRs (the release PR only bumps version metadata — `VERSION.md`, `CHANGELOG.md`, README, badge), you can instead add `github-actions[bot]` as a bypass actor on your branch protection ruleset:

1. Go to **Settings → Rules → Rulesets** → edit your ruleset
2. Under **Bypass list** → **Add bypass** → switch type to **App** → search for **GitHub Actions**
3. Save

This lets the bot-created PR merge without CI passing. Real code PRs from humans are unaffected.
