# Hoka Lash — Ads & Profit Dashboard

The reporting dashboard for the DIY Lash Extension Kit and the Beauty Tester
subscription: live Shopify sales, ad spend, claims, refunds, cancellations, and
profit (Overview / DIY Lash Kit / Beauty Tester / BT Profit tabs).

## Viewing the live reports

The dashboard runs here:

**https://beautytester.hokalash.com/dashboard**

It requires an access key appended to the URL (`?k=…`). The key is **private and
kept out of this repository on purpose** — ask the account owner
(contact@hokalash.com) for the current viewing link. Anyone with that link can
see the reports, so treat it like a password.

## What's in this repo

- `src/dashboard.js` — the dashboard page: layout, tabs, KPI cards, charts, and
  all the profit math shown on screen.

## What's intentionally NOT here

The payment side of the system (NMI card processing, the subscription/claim flow,
GHL, and all API secrets) is **deliberately excluded** from this repository. It
lives in a separate private deployment and must never be committed here. This repo
is the reporting/dashboard layer only.

## Data source

The dashboard reads live figures from Shopify (orders) and Meta (ad spend) through
the backend worker at deploy time. That backend is part of the private deployment
above; this file renders whatever the backend returns.
