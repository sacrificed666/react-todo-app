# 🛡️ Security policy

## ✅ What is supported

Only the current code on `main`, deployed to [GitHub Pages](https://sacrificed666.github.io/react-todo-app/), receives security fixes.

## 📮 Reporting a vulnerability

Please **do not open a public issue** for security problems.

1. Open the repository's **Security** tab and choose **Report a vulnerability** to send a private advisory.
2. Describe the problem, the affected commit and the steps to reproduce it.
3. If you have a proof of concept, attach it to the advisory rather than publishing it.

You can expect an acknowledgement within **3 working days** and a status update at least once a week until the report is resolved. Once a fix is deployed, the advisory is published and you are credited, unless you prefer to stay anonymous.

## 🎯 Scope

ToDo App is a static, offline-first web app: there is no backend, no account and no network traffic apart from loading the app itself and the language flag images from flagcdn.com. Reports are especially welcome about:

- 💉 script injection through task titles, notes, imported files, shared content or URL parameters;
- 🧱 ways to bypass the Content Security Policy or Trusted Types;
- 🗄️ data loss or corruption caused by crafted storage or import data;
- ⚙️ weaknesses in the CI/CD pipeline or the GitHub Actions workflows.

The measures already in place are described in [docs/security.md](../docs/security.md).
