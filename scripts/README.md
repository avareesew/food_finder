# Scripts

Utility scripts for development, verification, and maintenance tasks.

## Current Scripts

- `dev.sh` - Start the local dev server with project defaults
- `test.sh` - Run lint + build and save the output to `logs/test-<timestamp>.log`
- `test-slack-ingest.sh` - Hit the local Slack ingest endpoint and save the response/log output
- `scan-secrets.sh` - Scan tracked files and git history for likely committed secrets, excluding documented placeholders in `env.example`

## Notes

- Verification logs are part of the repo evidence trail. Keep the newest useful paths referenced in `aiDocs/changelog.md`.
- Live Vercel rollout is handled outside this repo's local scripts in the teammate-owned deployment workflow.
