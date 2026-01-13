# Menu & Services Management Backend

A production-ready backend system for managing categories, items, pricing, and bookings for restaurants and service providers.

## Features

- ✅ **Hierarchical Category Management**: Categories → Subcategories → Items
- ✅ **Tax Inheritance System**: Dynamic tax resolution from parent entities
- ✅ **Advanced Pricing Engine**: Static, Tiered, Complimentary, Discounted, and Dynamic pricing
- ✅ **Booking System**: Slot-based booking with conflict prevention
- ✅ **Add-ons Management**: Support for item add-ons with grouping
- ✅ **Soft Deletes**: All entities use soft delete for data integrity
- ✅ **Search & Filtering**: Full-text search with price range and category filters
- ✅ **Pagination & Sorting**: Efficient data retrieval

## Installation
# Menu & Services Management Backend

This repository is a backend service for managing categories, subcategories, items, add-ons, pricing and bookings for restaurants or service providers.

**Why this README:** explains what each dependency, folder, and pattern is for and why it was chosen — so contributors understand architectural decisions.

**Quick Start**
- **Install dependencies:** `npm install`
- **Create `.env`** with at least:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/menu_management
NODE_ENV=development
```
- **Run (dev):** `npm run dev` — runs `nodemon` for hot reload
- **Run (prod):** `npm start`

**Tech Stack & Why**
- **Express:** fast, minimal HTTP framework for Node.js; the routes and controllers use its middleware pattern. See [src/app.js](src/app.js).
- **Mongoose:** schema-based ODM for MongoDB; provides validation, hooks, and transactions which simplify models and booking sessions.
- **Joi:** input validation library used to validate request payloads before business logic runs (keeps controllers small and safe).
- **dotenv:** keeps environment configuration out of code and makes deployments predictable.
- **helmet:** basic HTTP hardening headers to improve security.
- **cors:** simple cross-origin resource sharing configuration for APIs.
- **morgan:** lightweight request logging to help debug requests during development.
- **nodemon (devDependency):** auto-restarts server in development to speed up iteration.

**Project Structure & Rationale**
- **[src/app.js](src/app.js)**: Application bootstrapping and middleware registration. Keeping this small makes it easy to reason about server startup.
- **[src/config/constants.js](src/config/constants.js)** & **[src/config/database.js](src/config/database.js)**: Centralized configuration and DB connection to avoid duplicating values and to make testing easier.
- **[src/models](src/models)**: Mongoose schemas. Keeping models isolated ensures a single source of truth for data shape and DB-level behavior (indexes, virtuals).
- **[src/services](src/services)**: Business logic (pricing calculations, tax resolution, booking conflict handling). Services exist so controllers only orchestrate HTTP → validation → service → response.
- **[src/controllers](src/controllers)**: Parse request, call services, return responses. This separation makes unit testing easier and prevents controllers from becoming monoliths.
- **[src/routes](src/routes)**: Declares routes and attaches validation/middleware. Keeping routes declarative simplifies adding endpoints and middleware composition.
- **[src/middleware](src/middleware)**: Error handling (`errorHandler.js`) and other request-level concerns. Centralizing middleware keeps behavior consistent across endpoints.
- **[src/utils](src/utils]**: Small helpers (time calculations, validators) to avoid duplicating logic.

**Key Design Decisions — what and why**
- **Service Layer (Why):** Moves complex domain logic out of controllers; enables re-use (e.g., pricing used by both APIs and scheduled jobs) and easier unit testing.
- **Tax Inheritance (Why):** Tax is resolved at query/service time from item → subcategory → category. This avoids denormalization and ensures updates at category level immediately reflect across children. Implemented with Mongoose queries/aggregation for performance and correctness.
- **Pricing Engine (Why):** Supports `static`, `tiered`, and `dynamic` pricing to accommodate common restaurant/service pricing patterns (bulk discounts, time-based offers). Encapsulated in `PricingService.js` to keep rules centralized and testable.
- **Soft Deletes (Why):** Mark items as inactive instead of removing them to preserve historical data and avoid accidental data loss.
- **Transactional Booking (Why):** Bookings use MongoDB sessions to perform checks and writes atomically to prevent race conditions and double-booking.
- **Aggregation Pipelines (Why):** Used for efficient parent-child lookups (categories → subcategories → items) and to compute nested values (resolved price + taxes) in the DB when appropriate for performance.
- **Validation (Why):** `joi` schemas in controllers ensure invalid requests fail early with clear messages.
- **Security & Observability (Why):** `helmet` for secure headers, `cors` for allowed origins, `morgan` for request logs during development.

**APIs — quick examples**
- Categories: `POST /api/categories`, `GET /api/categories?page=1&limit=10`
- Subcategories: `POST /api/subcategories`, `GET /api/subcategories?categoryId=xxx`
- Items: `POST /api/items`, `GET /api/items?search=coffee&minPrice=100&maxPrice=500`
- Add-ons per item: `POST /api/items/:itemId/addons`, `GET /api/items/:itemId/addons`
- Bookings: `GET /api/items/:id/availability?date=YYYY-MM-DD`, `POST /api/bookings`




