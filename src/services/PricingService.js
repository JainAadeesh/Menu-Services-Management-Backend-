const { PRICING_TYPES } = require("../config/constants");
const TaxService = require("./TaxService");
const Addon = require("../models/Addon");

class PricingService {
  async calculatePrice(item, context = {}) {
    const { quantity = 1, requestTime = new Date(), addonIds = [] } = context;

    let basePrice = 0;
    let appliedRule = "";

    switch (item.pricing.type) {
      case PRICING_TYPES.STATIC:
        basePrice = item.pricing.base_price;
        appliedRule = "Static pricing";
        break;

      case PRICING_TYPES.TIERED:
        const tier = this.findMatchingTier(item.pricing.tiers, quantity);
        if (!tier) {
          throw new Error("No matching tier found for quantity: " + quantity);
        }
        basePrice = tier.price;
        appliedRule = `Tiered pricing: ${tier.min_quantity}-${tier.max_quantity} units → ₹${tier.price}`;
        break;

      case PRICING_TYPES.COMPLIMENTARY:
        basePrice = 0;
        appliedRule = "Complimentary (Free)";
        break;

      case PRICING_TYPES.DISCOUNTED:
        const discountedPrice = this.applyDiscount(
          item.pricing.base_price,
          item.pricing.discount
        );
        basePrice = discountedPrice;
        appliedRule = `Discounted: ${item.pricing.discount.type} ${item.pricing.discount.value} off ₹${item.pricing.base_price}`;
        break;

      case PRICING_TYPES.DYNAMIC:
        const window = this.findActiveTimeWindow(
          item.pricing.time_windows,
          requestTime
        );
        if (!window) {
          throw new Error("Item not available at the requested time");
        }
        basePrice = window.price;
        appliedRule = `Dynamic pricing: ${window.start_time}-${window.end_time} → ₹${window.price}`;
        break;

      default:
        throw new Error("Invalid pricing type");
    }

    // Calculate addon prices
    const addonDetails = await this.calculateAddonPrice(addonIds);

    // Resolve tax
    const tax = await TaxService.resolveTax(item);
    const subtotal = basePrice + addonDetails.total;
    const taxAmount = tax.applicable ? subtotal * (tax.percentage / 100) : 0;

    const grandTotal = subtotal + taxAmount;

    return {
      applied_rule: appliedRule,
      base_price: basePrice,
      addons: addonDetails.items,
      addon_total: addonDetails.total,
      subtotal: subtotal,
      tax: {
        applicable: tax.applicable,
        percentage: tax.percentage,
        amount: parseFloat(taxAmount.toFixed(2)),
      },
      grand_total: parseFloat(grandTotal.toFixed(2)),
    };
  }

  findMatchingTier(tiers, quantity) {
    if (!tiers || tiers.length === 0) {
      return null;
    }

    // Validate no overlapping tiers
    for (let i = 0; i < tiers.length; i++) {
      for (let j = i + 1; j < tiers.length; j++) {
        const tier1 = tiers[i];
        const tier2 = tiers[j];

        if (
          (tier1.min_quantity <= tier2.max_quantity &&
            tier1.max_quantity >= tier2.min_quantity) ||
          (tier2.min_quantity <= tier1.max_quantity &&
            tier2.max_quantity >= tier1.min_quantity)
        ) {
          throw new Error("Overlapping tiers detected");
        }
      }
    }

    // Find matching tier
    for (const tier of tiers) {
      if (quantity >= tier.min_quantity && quantity <= tier.max_quantity) {
        return tier;
      }
    }

    return null;
  }

  findActiveTimeWindow(windows, requestTime) {
    if (!windows || windows.length === 0) {
      return null;
    }

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = dayNames[requestTime.getDay()];
    const currentTime = `${requestTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${requestTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    for (const window of windows) {
      if (window.days.includes(currentDay)) {
        if (
          currentTime >= window.start_time &&
          currentTime <= window.end_time
        ) {
          return window;
        }
      }
    }

    return null;
  }

  applyDiscount(basePrice, discount) {
    if (!discount) {
      return basePrice;
    }

    let finalPrice = basePrice;

    if (discount.type === "flat") {
      finalPrice = basePrice - discount.value;
    } else if (discount.type === "percentage") {
      finalPrice = basePrice - (basePrice * discount.value) / 100;
    }

    // Ensure price never goes negative
    return Math.max(0, finalPrice);
  }

  async calculateAddonPrice(addonIds) {
    if (!addonIds || addonIds.length === 0) {
      return { items: [], total: 0 };
    }

    const addons = await Addon.find({
      _id: { $in: addonIds },
      is_active: true,
    });

    const items = addons.map((addon) => ({
      id: addon._id,
      name: addon.name,
      price: addon.price,
    }));

    const total = addons.reduce((sum, addon) => sum + addon.price, 0);

    return { items, total };
  }
}

module.exports = new PricingService();
