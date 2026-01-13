module.exports = {
  PRICING_TYPES: {
    STATIC: "static",
    TIERED: "tiered",
    COMPLIMENTARY: "complimentary",
    DISCOUNTED: "discounted",
    DYNAMIC: "dynamic",
  },

  DISCOUNT_TYPES: {
    FLAT: "flat",
    PERCENTAGE: "percentage",
  },

  DAYS: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],

  BOOKING_STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
  },

  ADDON_SELECTION_TYPES: {
    SINGLE: "single",
    MULTIPLE: "multiple",
  },

  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
