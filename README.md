# GameForge PC Builder: Custom PC Configurator

## 🖥️ GameForge PC Builder

**GameForge PC Builder is a complete, end-to-end Angular application.** It went from a blank App Builder project to a **fully working storefront and Admin Backoffice** in a small number of AI-assisted iterations. It is a **finished, working product, not a prototype**: a **hardware catalog**, **shared PC build state**, **compatibility and power checks**, **live pricing** and **checkout**, plus an **Admin Backoffice** for **catalog management**, **inventory and stock management** and **order management**. Admin changes and storefront orders **sync both ways in real time**.

[App Builder](https://www.appbuilder.dev/) AI created and then evolved the UI using **8 prompts in total across both iterations** and **93 / 100 credits**. The generated app was **exported to Angular**, and **Claude Code** with the **Ignite UI MCP**, **Ignite UI Theming MCP** and **Ignite UI skills** made every screen functional.

## ✨ Features

| Area | Capability | Details |
| --- | --- | --- |
| **Storefront** | Hardware catalog | Search, category, tier, platform and quick filters, plus sorting |
| | Part replacement | Each build slot can swap its part from the catalog |
| | Compatibility and power checks | CPU socket, memory, form factor, GPU and cooler clearance, cooler mounting, PSU headroom |
| | Live pricing | Assembly tiers, thermal tuning, shipping, payment discounts and tax |
| | Saved configurations | A build survives a page reload |
| | Build Summary and checkout | Captures the customer name and shows an order confirmation |
| **Admin / Backoffice** | Admin Login | Demo sign-in; the Backoffice route is guarded |
| | Component management | Add components with category-specific compatibility specs, edit prices, discontinue or restore |
| | Inventory management | Stock quantities, reorder thresholds and availability rules |
| | Order management | Queue views, search, status filters, payment and fulfillment updates, shipment processing, CSV export |
| **Shared state and integration** | Shared build state | One signal-based build, used by every page |
| | Live storefront effects | Price changes, new parts, discontinued parts and stock levels show up straight away; out-of-stock and discontinued parts block checkout |
| | Safe discontinuation | A discontinued part stays in existing presets, saved builds and orders |
| | Order history | Customer orders appear in the Backoffice alongside the seeded demo orders |

## 🧰 Built With

- [Angular](https://angular.dev/)
- [Ignite UI for Angular](https://www.infragistics.com/products/ignite-ui-angular)
- [App Builder](https://www.appbuilder.dev/) AI
- [Claude Code](https://claude.com/claude-code)
- Ignite UI MCP and Ignite UI Theming MCP
- Ignite UI skills

## 🔄 Development Approach

```text
  Iteration 1                          Iteration 2
  ───────────                          ───────────
  App Builder AI                       New Admin requirement
        ↓                                    ↓
  Angular export                       App Builder update
        ↓                                    ↓
  Claude Code + Ignite UI MCP          Git delta (baseline → updated)
        ↓                                    ↓
  Functional storefront  ───────────►  Claude Code integration
                                             ↓
                                       Connected storefront + Backoffice
```

1. **Storefront.** The app was designed in App Builder and exported to Angular. Claude Code then replaced the placeholder data with a real hardware catalog and built the shared build state, compatibility checks, pricing, saved builds and checkout, keeping the generated design.
2. **Admin / Backoffice.** A new Admin requirement was designed in App Builder, starting from a published baseline. The Git delta between the baseline and the updated App Builder project showed exactly what was generated. That delta was integrated selectively into the evolved app:
   - **Reused:** the generated layouts and styles.
   - **Not copied:** the generated placeholder services and data.
   - **Implemented on the existing app:** all of the Admin behaviour, using its own services and conventions.

## 🚀 Run Locally

This project uses the licensed `@infragistics/igniteui-angular` package, so you need access to the Infragistics npm feed. If you don't have it yet, run `npm run infragistics-login` or see the [licensing guide](https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/ignite-ui-licensing).

```bash
npm install
npm start                  # dev server, opens http://localhost:4200
npm test -- --watch=false  # Vitest unit tests in headless Chromium
npm run lint               # ESLint
npm run build              # production build in dist/
```

Unit tests run in Chromium through Playwright. If Chromium isn't installed yet, run `npx playwright install chromium` first.

## 🔐 Demo Admin

Open **Admin** in the top navigation, or go to `/admin-login`, and sign in with:

- **Email:** `admin@gameforge.tech`
- **Password:** `forge-admin`

This is client-side demo authentication only, not real security. Catalog, inventory, order and session data is kept in the browser's `localStorage` / `sessionStorage`; clear the site data to reset the demo.
