# GitHub automation

- Keep automation limited to tests, static checks, and their build prerequisites.
- Use `main.yml` as the single entry point: push to main, pull requests, merge
  groups, and manual runs. Do not add schedules, organization bots, notifications,
  release publishing, automatic dependency updates, or PR/issue mutations.
- Keep token permissions read-only and disable persisted checkout credentials.
- Tests must work without organization secrets. Use local mocks and the dummy
  configuration; skip only tests explicitly requiring external credentials.
- Keep Chrome and Firefox E2E jobs on the latest stable browser channels.
- Preserve LavaMoat in test builds. Never make a failing job optional to make CI
  green. If an aggregate status is added, include every required testing job.
- Validate workflow syntax, local action paths, and job dependencies after edits.
- Report local validation separately from GitHub-hosted runs. Only push or change
  repository settings when the user requests it.
