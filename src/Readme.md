# Menu & Services Management Backend
 
## Why did you choose your database?

I chose **MongoDB** because the data structure in this system is naturally hierarchical and flexible. Categories, subcategories, items, pricing rules, availability windows, and add-ons vary from item to item. MongoDB lets us store these variations cleanly without complex joins while still supporting indexing for search and filtering. It also adapts well to evolving requirements, which is common in real products.

## Three things I learned while building this

1. **Business logic is more important than CRUD** — Implementing pricing rules, tax inheritance, and booking conflict handling is significantly more valuable than basic CRUD endpoints.
2. **Computed data should not be blindly stored** — Final prices and taxes should be computed at runtime or captured as immutable snapshots in `Booking` to avoid inconsistencies when rules change.
3. **Service-layer separation pays off** — Moving pricing, tax, and booking logic into `services/` made the code easier to test, reason about, and reuse.

## The hardest technical or design challenge I faced

Designing tax inheritance and pricing resolution without duplicating data was the toughest part. Items should inherit tax and certain pricing defaults from their parent subcategory or category, but bookings must remain auditable even after catalog changes. The solution was to resolve taxes at pricing time (walking up the entity hierarchy) and store snapshots of resolved prices/taxes on `Booking`.

## What you would improve or refactor if you had more time

- Refactor the pricing logic into strategy classes (clear separation for promotions, time-based tiers, and discount strategies).
- Add database transactions for booking operations to make them more robust under concurrent load.
- Improve automated test coverage, especially for edge cases around tax inheritance and time-based pricing.
- Add OpenAPI (Swagger) documentation for endpoints and sample request/response shapes.

**Overall Architecture**
- **Structure**: The codebase is a small Express.js service organized by feature: `routes/` (HTTP endpoints), `controllers/` (request handling), `services/` (business logic), `models/` (Mongoose schemas), `config/` (external configuration), `middleware/` (cross-cutting concerns), and `utils/` (helpers). This separation keeps transport, domain logic and persistence concerns decoupled for easier testing and evolution.
- **Why**: Feature folders map to bounded responsibilities (CRUD for categories/items/bookings). `services/` encapsulate core algorithms (pricing, tax calculations, search) so they can be reused from different transports (CLI, jobs, or HTTP) without duplicating logic.

**Data Modeling Decisions**
- **Primary entities**: `Category`, `Subcategory`, `Item`, `Addon`, `Booking`.
- **Shape**: Models favor small, explicit documents (Mongoose schemas) that store the authoritative pricing and tax metadata where it naturally belongs (e.g., `Item` stores base price; `Addon` stores addon price and tax rules).
- **Normalization vs denormalization**: We keep canonical definitions (names, prices, tax rates) on their owning documents and denormalize a snapshot into `Booking` at creation time. This protects historical bookings from downstream changes (price/tax edits) while keeping lookups simple.

**How Tax Inheritance Is Implemented**
- **Concept**: Taxes can be defined at multiple levels (category → subcategory → item → addon). The effective tax for a priced entity is the nearest defined tax moving from the specific entity up to its ancestors.
- **Implementation**: During pricing, the `TaxService` exposes a `resolveTax(entity)` function that:
   - Checks the entity for an explicit tax field.
   - If missing, walks to the parent (e.g., item → subcategory → category) to find the first tax definition.
   - Returns a consolidated tax object (type, rate, name) used by the pricing calculation.
- **Why this approach**: It keeps model schemas simple, supports overrides at more specific levels, and minimizes duplication of tax configs while enabling bookings to capture resolved taxes for auditability.

**How the Pricing Engine Works**
- **Flow (high level)**:
   1. Controller receives booking request (selected `Item` + optional `Addon`s, quantities, timestamps).
   2. `BookingService` collects relevant entities (item, its subcategory/category, addons).
   3. `PricingService` computes subtotal: `basePrice * qty + sum(addons)`.
   4. For each price line, `TaxService.resolveTax()` supplies the applicable tax rate.
   5. Taxes are applied per-line (tax-on-item, tax-on-addon) and aggregated.
   6. Final price = subtotal + taxes (optionally adjustments/fees).
- **Idempotency & snapshots**: The booking stores a snapshot of the priced lines (unit price, resolved tax, totals) so later reads/reporting are stable even if catalog prices change.
- **Extensibility**: `PricingService` is implemented as a small pipeline—price calculation, tax resolution, aggregation—so new steps (discounts, promo codes, multi-currency conversion) can be inserted with limited changes.

**Tradeoffs & Simplifications**
- **What’s simplified**:
   - No comprehensive regional tax rules (e.g., compound taxes, thresholds); instead we use a single rate-per-entity model to keep the service focused.
   - Rounding strategy is applied at the line-level with a single configurable rule rather than currency-specific rounding detail.
   - No promotions/complex discount engine—these were deferred to keep the core pricing and tax logic small and auditable.
- **What’s omitted**:
   - Multi-currency pricing and conversions (single-currency assumption).
   - Advanced validation such as inventory reservation or concurrency booking locks.
- **Why these choices**: Prioritize clarity, auditability, and correctness for basic pricing and tax flows. The code aims to be a solid foundation that can be extended when product requirements justify complexity.




- **Healthcheck**: GET /health responds with service status.

**Where to Look in the Code**
- **Routes & controllers**: `routes/` and `controllers/` show how HTTP maps to service calls.
- **Pricing/Taxes**: `services/PricingService.js` and `services/TaxService.js` contain the core algorithms and the inheritance lookup.
- **Models**: `models/` holds Mongoose schemas and indicates which fields are snapshots vs. references.

**Next Steps / Notes for Future Work**
- Add a promotions/discount pipeline and a test-suite around pricing edge cases.
- Introduce integration tests that cover tax-inheritance permutations.
- Consider expanding tax rules to support compound/threshold taxes when needed by business requirements.

