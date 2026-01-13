# Menu & Services Management Backend

This project is a backend system built to manage categories, items, pricing, availability, bookings, and add-ons for a restaurant or service-based platform.  
The goal of this assignment is **not CRUD**, but to demonstrate **real-world backend engineering**, including business logic, edge-case handling, and clean architecture.

---

## Why did you choose your database?

I chose **MongoDB** because the data structure in this system is naturally hierarchical and flexible.  
Categories, subcategories, items, pricing rules, availability windows, and add-ons vary from item to item. MongoDB allows storing these variations cleanly without complex joins while still supporting indexing for search, filtering, and performance.

It also works well for evolving requirements, which is common in real products.

---

## Three things I learned while building this project

1. **Business logic is more important than CRUD**  
   The hardest and most valuable part was implementing pricing rules, tax inheritance, and booking conflicts correctly rather than just storing data.

2. **Computed data should not be stored**  
   Prices and taxes should be calculated dynamically. Storing final values leads to inconsistency when tax rules or pricing logic change.

3. **Service-layer separation matters**  
   Moving pricing, tax, and booking logic into services made the code easier to understand, test, and extend compared to putting logic inside controllers.

---

## The hardest technical or design challenge you faced

The hardest challenge was designing **tax inheritance and pricing resolution without duplicating data**.

Items can inherit tax from subcategories or categories, and pricing depends on multiple factors such as time, tiers, discounts, and availability.  
Ensuring that changes at the category level automatically affect all dependent items—without updating every record—required careful separation between stored data and runtime computation.

---

## What you would improve or refactor if you had more time

If I had more time, I would:

- Refactor pricing logic into separate strategy classes instead of a single pricing service
- Add database transactions to make booking operations more robust
- Improve automated test coverage, especially for time-based pricing and booking conflicts
- Add Swagger/OpenAPI documentation for better API discoverability

---

## Architecture Overview

The project follows a layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain all business logic (pricing, tax, booking, search)
- **Models**: Define database schemas
- **Middleware**: Handle validation, errors, and pagination
- **Utils**: Reusable helper logic (time checks, validations)

This structure keeps controllers thin and ensures complex logic is isolated and maintainable.

---

## Key Design Decisions

- No hard deletes; `is_active` is used for soft deletion
- Final prices are calculated dynamically, not stored
- Tax inheritance follows Category → Subcategory → Item
- Booking conflicts are validated before confirmation
- Add-ons affect final pricing and support optional/mandatory rules

---

## Conclusion

This project focuses on **clarity, correctness, and real-world behavior** rather than unnecessary features.  
The design prioritizes maintainability, scalability, and correct business logic, reflecting how production backend systems are typically built.
