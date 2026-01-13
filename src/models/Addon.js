const mongoose = require("mongoose");
const { ADDON_SELECTION_TYPES } = require("../config/constants");

const addonSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Addon name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Addon price is required"],
      min: [0, "Price cannot be negative"],
    },
    is_mandatory: {
      type: Boolean,
      default: false,
    },
    group_name: {
      type: String,
      trim: true,
      default: null,
    },
    group_selection_type: {
      type: String,
      enum: Object.values(ADDON_SELECTION_TYPES),
      default: ADDON_SELECTION_TYPES.MULTIPLE,
    },
    max_selections: {
      type: Number,
      min: 1,
      default: null,
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

addonSchema.index({ itemId: 1, is_active: 1 });
addonSchema.index({ itemId: 1, group_name: 1 });

module.exports = mongoose.model("Addon", addonSchema);
