# QR Splitter App Requirements

## 1. Project overview and goal

The QR Splitter app helps a merchant or cashier split a total bill into equal shares and generate a separate UPI QR for each share. The app is designed for quick offline use in a browser, with a print-friendly output for handing over to customers or collecting payment.

The core objective is to support a simple workflow:

- enter the total amount
- choose how many people or shares to split across
- calculate equal splits automatically
- generate one QR code per split share
- print or save the share sheet for payment collection

This first version is intentionally simple and static, with no backend or login required.

## 2. Offline-first requirement

The app should work as a local-first static web app:

- it must run without a server dependency for basic operations
- the app should be usable from a local browser tab or saved on a device
- the transaction data should remain in the browser only unless the user explicitly prints or exports it
- browser-only data storage may be used for recent values or previous state
- no user account, cloud sync, or external database is required for the initial version

## 3. Split QR logic

The app must support equal split logic for common amounts such as:

- ₹4500 split into 3 shares = ₹1500 + ₹1500 + ₹1500
- ₹1000 split into 4 shares = ₹250 + ₹250 + ₹250 + ₹250
- odd values should be distributed as evenly as possible using a rounding strategy

Recommended split behavior:

- divide total amount by number of shares
- if there is a remainder in paise or cents, distribute the extra value across the first few shares
- show the final split values clearly so the merchant can verify them
- ensure the total of all split amounts equals the original total amount exactly

Example:

- total = ₹4500
- split count = 3
- each share = ₹1500

Example with rounding:

- total = ₹1001
- split count = 3
- possible output = ₹334.00 + ₹333.50 + ₹333.50

## 4. Functional requirements

### 4.1 Amount input

- accept total amount in INR
- support decimal values for paise-based calculations
- reject invalid or negative values
- enforce a sensible minimum value such as ₹1

### 4.2 Split count

- accept integer split count from 2 to a practical maximum such as 20
- prevent zero or invalid counts
- calculate an equal split for each member

### 4.3 Equal split calculation

- compute equal share values for all members
- show a clear per-share amount
- keep the sum of the split values equal to the original total
- display each share label such as Share 1 of 3

### 4.4 QR generation

- generate a separate QR code for each split amount
- each QR should represent a UPI payment request for that member’s amount
- the QR payload should include the merchant UPI ID and share amount
- the generated UPI deep link should be easy to scan with any standard UPI app

### 4.5 Print layout

- provide a clean, print-friendly view
- each split should be visible as a separate card with amount and QR code
- print output should be optimized for paper or PDF export

### 4.6 Browser-only operation

- no signup or login required
- no backend API required for version 1
- static HTML, CSS, and JavaScript only

## 5. UI and flow expectations

The first screen should guide the merchant in a simple flow:

1. enter total amount
2. enter number of splits
3. enter merchant UPI ID and merchant name
4. click Generate QR split
5. view all split cards with amounts and QR codes
6. click Print to print the sheet

The UI should be:

- clean and mobile-friendly
- readable in low-light or bright environments
- visually structured with cards and minimal clutter
- quick to operate for a cashier or merchant counter

## 6. Technical requirement using HTML, CSS, and JavaScript

The first implementation must use:

- HTML for structure
- CSS for styling and print layout
- JavaScript for logic and dynamic split generation

Technical expectations:

- a single-page static interface
- no framework dependency for the MVP
- browser local state with localStorage if needed
- UPI deep-link generation logic in JavaScript
- QR generation using a client-side library or browser-safe approach

## 7. Edge cases and validation

The app should handle:

- decimal values such as ₹999.99
- split counts above 2
- zero or invalid amounts
- extremely large totals
- rounding differences across split values
- local browser restrictions or unsupported QR generation libraries

It should also clearly communicate invalid input with friendly messages instead of crashing.

## 8. Future enhancements

Planned enhancements for later versions include:

- merchant UPI settings stored in browser settings
- threshold-based charge rules
- custom split values rather than equal split only
- storing recent transactions locally
- print/export sheet to PDF or image
- admin and cashier mode separation
- support for GST, service charges, or tips

## 9. Open questions before implementation

Before building the final version, the following questions need answers:

- should the initial version support only equal splitting or also custom split values?
- do we need QR generation for each share using a live UPI ID, or a placeholder merchant ID for testing?
- should the app support both mobile and desktop print layouts?
- should there be a merchant settings panel in the first version?
- does the app need offline caching and installability as a PWA in the next step?
- are there any compliance rules or legal concerns around storing merchant UPI data locally?

## 10. Recommended initial implementation

The first version should remain intentionally simple:

1. total amount input
2. split count input
3. equal split logic
4. per-split QR generation
5. print-friendly layout
6. local browser-only operation

This keeps the scope practical and ensures the project is usable quickly without requiring a backend or deployment system.
