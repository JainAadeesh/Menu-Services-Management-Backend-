const mongoose = require("mongoose");
const { PRICING_TYPES, DISCOUNT_TYPES, DAYS } = require("../config/constants");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      validate: {
        validator: function (value) {
          // Either categoryId or subcategoryId must be set, but not both
          return (
            (value && !this.subcategoryId) || (!value && this.subcategoryId)
          );
        },
        message:
          "Item must belong to either a category or subcategory, but not both",
      },
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    tax_applicable: {
      type: Boolean,
      default: null,
    },
    tax_percentage: {
      type: Number,
      default: null,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"],
    },
    pricing: {
      type: {
        type: String,
        enum: Object.values(PRICING_TYPES),
        required: [true, "Pricing type is required"],
      },
      base_price: {
        type: Number,
        min: [0, "Price cannot be negative"],
      },
      tiers: [
        {
          min_quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          max_quantity: {
            type: Number,
            required: true,
            min: 0,
          },
          price: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      discount: {
        type: {
          type: String,
          enum: Object.values(DISCOUNT_TYPES),
        },
        value: {
          type: Number,
          min: 0,
        },
      },
      time_windows: [
        {
          days: [
            {
              type: String,
              enum: DAYS,
            },
          ],
          start_time: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
          },
          end_time: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
          },
          price: {
            type: Number,
            min: 0,
          },
        },
      ],
    },
    is_bookable: {
      type: Boolean,
      default: false,
    },
    availability: {
      days: [
        {
          type: String,
          enum: DAYS,
        },
      ],
      time_slots: [
        {
          start_time: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
          },
          end_time: {
            type: String,
            match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
          },
          max_concurrent_bookings: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
itemSchema.index({ name: "text", description: "text" });

// Price index for range queries
itemSchema.index({ "pricing.base_price": 1 });

// Compound indexes for uniqueness
itemSchema.index(
  { categoryId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { categoryId: { $exists: true } },
  }
);

itemSchema.index(
  { subcategoryId: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { subcategoryId: { $exists: true } },
  }
);

module.exports = mongoose.model("Item", itemSchema);
