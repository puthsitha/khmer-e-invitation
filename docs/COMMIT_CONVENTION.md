# Commit Message Convention

Enforced by the `commit-msg` git hook at `.githooks/commit-msg` (installed automatically via the `prepare` script in `package.json`, which runs `git config core.hooksPath .githooks`).

## Format

```
<emoji> <type>(scope): short description
```

- `scope` is optional.
- `Merge`, `Revert`, `fixup!`, `squash!`, and `amend!` commit subjects are let through untouched.

## Types

| Emoji | Type          | Description                                |
| ----- | ------------- | ------------------------------------------- |
| ✨    | `feat`        | Introducing a new feature                   |
| 🐛    | `fix`         | Fixing a bug                                |
| ♻️    | `refactor`    | Refactoring code (no feature or fix)        |
| 📦    | `build`       | Build system or dependency changes          |
| 🚀    | `perf`        | Improving performance                       |
| 📝    | `docs`        | Documentation changes                       |
| ✏️    | `test`        | Adding or updating tests                    |
| 🎨    | `style`       | Non-functional code changes (formatting)    |
| 🔧    | `chore`       | Miscellaneous tasks (config, cleanup)       |
| 🔼    | `upgrade`     | Upgrading dependencies                      |
| 🔒    | `security`    | Security fixes                              |
| 🔥    | `remove`      | Removing code or files                      |
| ◀️    | `revert`      | Reverting changes                           |
| 〰️    | `wip`         | Work in progress                            |
| 🎉    | `init`        | Beginning a project                         |
| 🚑️   | `hotfix`      | Critical fix that can't wait                |
| 💄    | `ui`          | Adding or updating UI/style files           |
| 🌐    | `i18n`        | Internationalization and localization       |
| 🚚    | `move`        | Moving or renaming files                    |
| 🔖    | `release`     | Releasing/tagging a version                 |
| 👷    | `ci`          | Adding or updating CI build system          |
| 🗃️    | `db`          | Database schema or migration changes        |
| ♿    | `a11y`        | Improving accessibility                     |
| ➕    | `deps-add`    | Adding a dependency                         |
| ➖    | `deps-remove` | Removing a dependency                       |
| 🔐    | `secret`      | Adding or updating secrets                  |

## Examples

```
✨ feat(auth): add biometric login
🐛 fix(cart): crash on empty cart
🎉 init(scaffold): bootstrap Next.js + Tailwind + Firebase project
```
