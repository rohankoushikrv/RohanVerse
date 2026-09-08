# Goa Trip Splitwise App

## 1. Product Summary

Build a polished, mobile-first expense splitting web app for a Goa trip with two couples, typically four travelers. The app will use only HTML, CSS, and vanilla JavaScript and will be hosted as a static site on GitHub Pages.

The app must work without a server or login. Trip data will be stored in the browser using `localStorage`, with import and export tools so the data can be backed up or moved to another device.

The visual direction is premium dark mode: rich contrast, expressive typography, refined panels, subtle motion, responsive layouts, and clear financial summaries.

## 2. Goals

- Make adding a shared expense take less than 30 seconds.
- Make it immediately clear who owes whom and how much.
- Support both couple-level and individual-level splitting.
- Provide reliable arithmetic for addition, subtraction, multiplication, averages, percentages, and custom shares.
- Work well on a phone during travel and on a desktop after the trip.
- Avoid requiring an account, backend, or paid service.
- Make all calculations explainable rather than showing unexplained totals.

## 3. Target Users and Default Setup

### Default trip

- Trip name: `Goa Getaway`
- Currency: Indian Rupee (`INR`, symbol `Rs`)
- Participants: four editable travelers
- Suggested initial names:
  - Rohan
  - Partner 1
  - Partner 2
  - Partner 3
- The app must allow any number of participants later, with a recommended practical limit of 20 for a single trip.

### User modes

- Organizer: creates the trip and manages participants.
- Traveler: uses the same local app on the shared device or imports the trip file.
- The app does not need authentication in the first release.

## 4. Scope and Release Plan

### MVP: required for first release

1. Create and edit one trip.
2. Add, edit, duplicate, and delete participants.
3. Add, edit, duplicate, and delete expenses.
4. Split expenses equally, by exact amount, by percentage, by shares, or by selected people.
5. Support one or more payers for an expense.
6. Display total spending, per-person paid amount, per-person owed amount, and net balance.
7. Generate a simplified settlement plan.
8. Support the required arithmetic operations in a calculator panel.
9. Persist data in `localStorage`.
10. Export and import trip data as JSON.
11. Export an easy-to-read settlement summary as CSV or printable text.
12. Responsive dark interface for mobile, tablet, and desktop.
13. Clear validation, undo after deletion, empty states, and success/error feedback.

### Version 1.1: recommended follow-up

- Multiple trips.
- Expense categories and category totals.
- Receipt image attachments stored locally.
- Search, filters, and date range filtering.
- Shareable read-only summary generated as a downloadable HTML file.
- Couple grouping and couple-to-couple settlement view.
- Installable PWA behavior with offline caching.
- Optional PIN lock for the local app.

### Premium-feeling enhancements

These are visual and workflow enhancements, not paid features or external subscriptions:

- Trip dashboard with animated summary numbers.
- Smart settlement optimization to minimize the number of payments.
- Quick-add expense presets such as hotel, fuel, meals, drinks, activities, and shopping.
- Split suggestions based on the last-used pattern.
- Per-person spending heatmap by day.
- Budget progress ring and category budget alerts.
- Receipt capture with local image compression.
- Timeline view of all expenses.
- Couple mode that shows both individual and couple totals.
- Settlement instructions that can be copied as plain text for WhatsApp.
- Undo history for the last several changes.
- A polished print layout for the final trip report.
- Optional playful trip theme, while keeping the default interface professional.

## 5. Information Architecture

The first release should use a single-page application with a compact navigation system:

1. **Dashboard**
   - Trip name and trip date range.
   - Total spent.
   - Number of expenses.
   - Average spend per person.
   - Current balance status.
   - Primary `Add expense` action.
   - Recent expenses.
   - Quick settlement preview.

2. **Expenses**
   - Full expense list.
   - Search and category filters.
   - Sort by newest, oldest, highest amount, or category.
   - Edit, duplicate, and delete actions.

3. **Balances**
   - Each participant's paid, owed, and net balance.
   - Who should receive money.
   - Who should pay money.
   - Optimized settlement transactions.
   - Copy settlement summary action.

4. **Calculator**
   - Basic arithmetic tools.
   - Expense split preview.
   - Formula history for the current session.

5. **Settings**
   - Trip details.
   - Participant management.
   - Currency and rounding settings.
   - Import, export, reset, and data privacy information.

## 6. Expense Model

Each expense should contain:

- Unique ID.
- Description, required, for example `Beach shack lunch`.
- Amount, required, greater than zero.
- Currency, default `INR`.
- Date and optional time.
- Category, selected from a fixed list plus `Other`.
- Notes, optional.
- One or more payers and how much each payer paid.
- Included participants.
- Split method.
- Split values for the selected method.
- Optional receipt image stored locally.
- Created and updated timestamps.

### Suggested categories

- Accommodation
- Travel
- Fuel
- Food
- Drinks
- Activities
- Shopping
- Tickets
- Emergency
- Other

## 7. Split Methods and Rules

Every expense must show a live split preview before saving.

### Equal split

Divide the expense equally among selected participants. Rounding must be deterministic: the app should distribute leftover paise to the first selected participants in a stable order so the individual values always sum exactly to the expense total.

### Exact amounts

The user enters each participant's amount. The form is valid only when the entered values sum exactly to the expense amount, within the selected currency precision.

### Percentage split

The user enters each participant's percentage. The form is valid only when percentages total exactly 100 percent, within a small display tolerance that is resolved before saving.

### Share-based split

The user assigns weighted shares, such as 2 shares, 1 share, 1 share. The app calculates each participant's proportional amount and applies deterministic rounding.

### Selected people only

The app equal-splits the expense among only the selected participants. This is a shortcut for common situations such as one couple joining an activity.

### Custom formula split

Optional for MVP if implementation remains simple. The user can use the calculator to determine a final amount, but the saved expense must still use one of the explicit split methods above so balances remain auditable.

### Multiple payers

If multiple people paid, each payer's contribution must be recorded. The total payer amounts must equal the expense amount before saving.

## 8. Arithmetic and Calculator Requirements

The calculator must support:

- Addition: `a + b`
- Subtraction: `a - b`
- Multiplication: `a * b`
- Division: `a / b`
- Average: `(a + b + c) / n`
- Percentage calculation: `amount * percentage / 100`
- Per-person calculation: `total / number of people`
- Repeated quantity calculation, such as `4 * 250`.
- Parentheses for grouped expressions.
- Decimal values appropriate for INR.
- Clear, backspace, keyboard input, and reset controls.
- Safe expression parsing. Do not execute raw user input with `eval`.
- Friendly errors for division by zero, malformed expressions, and empty input.

The expense form may include a compact calculator trigger so users can calculate an amount without leaving the form.

## 9. Balance and Settlement Logic

For each participant:

- `paid` is the sum of that participant's payer contributions.
- `owed` is the sum of that participant's assigned expense shares.
- `net` is `paid - owed`.

Interpretation:

- Positive net: the participant should receive money.
- Negative net: the participant owes money.
- Zero net: the participant is settled.

The settlement generator should:

1. Create creditor and debtor lists from net balances.
2. Match debtors to creditors.
3. Produce the smallest practical set of payments.
4. Round each payment to currency precision.
5. Ensure the sum of outgoing and incoming transactions remains balanced.
6. Explain that the suggested payments are a simplification and can be adjusted manually.

Example output:

- `A pays B Rs 850`
- `C pays D Rs 420`

The UI must never hide a rounding adjustment. If rounding creates a difference, show it explicitly and attach it to a named participant according to the configured rounding rule.

## 10. Dashboard Metrics

The dashboard should show:

- Total trip spend.
- Total paid across all expenses.
- Number of expenses.
- Average expense amount.
- Average spend per person.
- Highest expense.
- Most-used category.
- Number of people who are owed money.
- Number of people who need to pay.
- Budget used and remaining, if a budget is configured.

All metrics must update immediately after an expense is added, edited, or removed.

## 11. UI and Visual Requirements

### Theme

- Dark theme is the default and first-release theme.
- Use near-black or charcoal surfaces rather than pure black everywhere.
- Use a strong accent color for primary actions and a separate positive/negative color system for balances.
- Avoid low-contrast gray text on dark backgrounds.
- Use CSS custom properties for colors, spacing, typography, radii, shadows, and motion.

### Layout

- Mobile-first responsive layout.
- Bottom navigation or compact navigation on narrow screens.
- Sidebar or top navigation on wider screens.
- Sticky primary action on mobile where useful.
- Stable dimensions for cards, buttons, numeric tiles, and list rows.
- Do not use excessive decorative cards or nested cards. Use framed panels only for genuinely grouped information.

### Interaction quality

- Keyboard accessible controls.
- Visible focus states.
- Tooltips for unfamiliar icon-only buttons.
- Confirmation for destructive actions.
- Undo option after deletion.
- Toast or inline feedback after save, import, export, and reset.
- Loading-free interactions should still provide a clear state transition.
- Respect `prefers-reduced-motion`.

### Typography and motion

- Use an intentional display font paired with a readable body font, loaded from a privacy-conscious source or with a robust fallback.
- Use subtle page-load and staggered list-entry animations.
- Do not animate numbers in a way that makes financial values hard to read.

## 12. Data Storage and Privacy

- Store trip data locally in `localStorage`.
- Save the complete current app state after every successful change, including participant edits, expense additions/edits/deletions, settings changes, budget changes, and settlement preferences.
- On every app launch or browser reopen, automatically read the most recent valid saved state and restore the trip before showing the dashboard.
- Show a short restoring state while startup data is being read, then show the restored trip name and last-saved time in Settings or the app header.
- If no saved state exists, open the first-run trip setup with the default Goa trip values.
- Never overwrite valid saved data with an incomplete form draft or a failed save operation.
- Keep a small, separate last-known-good backup in local storage so the app can recover if the primary saved state is malformed.
- If saved data is corrupted or cannot be parsed, preserve it for export or diagnosis, restore the last-known-good backup when available, and show a clear recovery message rather than silently starting over.
- Use a versioned storage key and migration function so future app versions can safely update older saved data.
- Listen for the browser `storage` event and notify the user when the same trip was changed in another open tab; provide a reload or review action before replacing the current in-memory state.
- Do not send expenses, names, receipts, or financial data to any server.
- Clearly state in Settings that clearing browser storage can remove the data.
- Export a versioned JSON backup containing a schema version.
- Validate imported JSON before replacing current data.
- Provide a reset action with an explicit confirmation.
- Receipt images must be size-limited and compressed before local storage to reduce quota problems.

## 13. GitHub Pages Requirements

- The app must work from a static hosting path, including a repository subpath.
- Do not assume the site is hosted at `/` when creating asset URLs.
- Avoid server-side routing that requires rewrite rules.
- Use relative asset paths.
- Include a simple `index.html` entry point.
- Include a README with local preview and GitHub Pages deployment instructions.
- No build step is required for MVP unless a future library makes it worthwhile.
- The app must function after opening the built files through a static server.

## 14. Accessibility and Compatibility

- Semantic HTML landmarks and headings.
- Every form field has a visible label.
- Color is not the only indicator of paid or owed status.
- Sufficient contrast for body text, controls, and status labels.
- Full keyboard operation for dialogs, forms, navigation, and calculator.
- Dialogs trap focus and close predictably.
- Responsive at approximately 320px through large desktop widths.
- Test in current Chrome, Edge, Firefox, and Safari where practical.

## 15. Validation Rules

- Participant names are required and unique within a trip.
- Expense descriptions are required.
- Expense amounts must be finite and greater than zero.
- Payer totals must equal the expense amount.
- Selected participants must contain at least one person.
- Split totals must equal the expense amount.
- Percentages must total 100 percent.
- Shares must be non-negative, and at least one share must be greater than zero.
- Dates must be valid.
- Imported files must match the expected schema and reject malformed data without deleting current data.

## 16. Suggested File Structure

```text
/index.html
/styles.css
/app.js
/storage.js
/calculator.js
/settlements.js
/ui.js
/README.md
/REQUIREMENTS.md
```

A single `app.js` is acceptable for the MVP if the code remains organized into clearly named sections. Separate files are preferred once the logic grows.

## 17. Definition of Done

The first release is ready when:

- A user can create the four-person Goa trip without editing code.
- A user can record expenses paid by one or multiple people.
- Equal, exact, percentage, and share splits produce totals that reconcile exactly.
- The calculator performs addition, subtraction, multiplication, division, averages, percentages, and grouped expressions safely.
- Dashboard totals and balances update immediately after every change.
- The settlement list is mathematically consistent with participant net balances.
- Data survives a page refresh.
- Exported JSON can be imported back successfully.
- The layout is usable on a phone and desktop.
- Destructive actions are confirmed and reversible at least through undo where specified.
- The app can be deployed to GitHub Pages with no backend.
- No console errors occur during the core add/edit/delete/import/export flows.

## 18. Acceptance Test Scenarios

1. Add a Rs 1,000 dinner paid by Rohan and split equally among four people. Each person owes Rs 250 and Rohan's net is positive Rs 750.
2. Add a Rs 900 taxi paid by Partner 1, split only between Partner 1 and Partner 2. Each selected person owes Rs 450.
3. Add a Rs 2,000 hotel expense with exact shares of Rs 1,000, Rs 500, Rs 300, and Rs 200. The form saves and the total is Rs 2,000.
4. Add a Rs 1,000 activity with percentages of 50, 25, 15, and 10. The form saves and the total is Rs 1,000.
5. Add a Rs 1,000 expense using shares 2, 1, 1, 0. The zero-share participant owes nothing.
6. Enter `4 * 250 + 100` in the calculator and get `1100`.
7. Try to save an exact split totaling Rs 990 for a Rs 1,000 expense. The app blocks the save and identifies the difference.
8. Delete an expense, use Undo, and confirm that totals return to their previous values.
9. Refresh the page and confirm that participants, expenses, balances, and settings remain.
10. Export JSON, clear the current trip only after confirmation, import the JSON, and confirm that all data returns.
11. Resize from a 320px-wide viewport to a desktop viewport and confirm that no primary content is clipped or overlaps.
12. Navigate and complete the add-expense flow with a keyboard only.
13. Add an expense, close or reload the browser, reopen the app, and confirm that the expense and updated totals are restored automatically.
14. Change a participant name and setting, reopen the app, and confirm that the latest successful changes are present.
15. Begin editing an expense without saving, close or reload the app, and confirm that the incomplete draft did not replace the last saved state.
16. Simulate malformed primary storage and confirm that the last-known-good backup is restored with a visible recovery message.
17. Open the same trip in two tabs, change it in one tab, and confirm that the other tab detects the external change before replacing its current state.

## 19. Open Product Decisions Before Implementation

Please confirm these choices before coding:

- Should the app support multiple trips in the first release, or one trip only?
- Should the default currency be INR only, or should users be able to choose currencies?
- Should participant couple grouping be part of the MVP or a later enhancement?
- Should receipts be included in the first release, given local storage limits?
- Should the app use an external font CDN, or remain fully self-contained for offline use?
- Do you want a playful Goa accent theme, or a more restrained premium finance aesthetic?
- Should the first version include the PWA install/offline layer, or should that follow the core expense workflow?

## 20. Recommended Build Order After Approval

1. Create the static page shell, theme tokens, and responsive navigation.
2. Add trip and participant setup.
3. Implement the data schema and local storage service.
4. Build the expense form and split preview.
5. Add safe calculator parsing.
6. Implement balance calculations and settlement optimization.
7. Build dashboard, expense list, and balances views.
8. Add import/export, validation, confirmations, and undo.
9. Add responsive polish, accessibility, motion, and empty states.
10. Run acceptance scenarios and deploy a production preview to GitHub Pages.
