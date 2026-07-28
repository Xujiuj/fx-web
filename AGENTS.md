# Deployment And Incident Policy

## Remote Target

- Host: `8.145.48.29`
- User: `root`
- Authentication: interactive deployments use the protected runtime variable `DEPLOY_SSH_PASSWORD`; GitHub Actions uses the repository secret `DEPLOY_PASSWORD`. Never write credentials to source files, Git history, terminal output, or logs.

## Incident Handling

Before making any change to the remote service, investigate the failure from logs and identify its root cause.

1. Inspect the affected service state and deployment logs first.
2. Trace the failing request, process, or dependency to the originating error.
3. Make a complete fix for the identified cause. Do not apply speculative, superficial, or patch-only changes.
4. Validate the fix locally and after deployment using service health checks and logs.

## Deployment

Pushing to `main` starts the GitHub Actions workflow that verifies and deploys to the remote target by replacing the existing service in place. Interactive releases remain user-directed.

- Do not create backup archives, snapshots, or duplicate service copies unless the user explicitly changes this instruction.
- Do not delete or overwrite remote service files outside the confirmed deployment target.
- After the replacement, verify service health and inspect logs for startup or request failures.
