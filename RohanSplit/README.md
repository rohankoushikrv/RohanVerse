# Rohan Trip Calculator

A private, local-first expense splitter for a Goa trip with two couples. Built with plain HTML, CSS, and JavaScript so it can be hosted directly on GitHub Pages.

## Features

- Dark premium responsive interface
- Four traveler default setup, with editable participants
- Add, edit, duplicate-ready expense workflow with categories
- Equal, exact amount, percentage, and share-based splits
- Multiple payer selection with automatic equal payer allocation
- Live balances and optimized settlement suggestions
- Safe calculator for arithmetic, percentages, averages, and grouped expressions
- Local autosave after every successful change
- Automatic restoration when the app is reopened
- Versioned JSON export and import
- Budget tracking and local-only privacy messaging
- No backend, account, or external database required

## Run locally

From the project folder, start any static server. For example:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173` in a browser.

## Publish with GitHub Pages

1. Create a GitHub repository and push this folder to its default branch.
2. Open the repository's **Settings** page.
3. Select **Pages** under **Code and automation**.
4. Choose **Deploy from a branch**.
5. Select the branch and the root folder, then save.
6. Open the generated Pages URL.

The app uses relative asset paths and client-side state, so it works from a repository subpath without a build step.

## Data and backups

Trip data is stored in the browser's `localStorage`. It is not uploaded to GitHub Pages or any other server. Export a JSON backup before clearing browser data or moving to another device. Imported backups are validated before they replace the current trip.

The browser's storage is scoped to the site origin. A different browser, device, private browsing session, or changed domain will have a separate local trip unless you import a backup.

## Project files

- `index.html` - application markup and views
- `styles.css` - dark theme, responsive layout, and interaction states
- `app.js` - state, persistence, calculations, split logic, rendering, and event handling
- `REQUIREMENTS.md` - product requirements and acceptance scenarios
