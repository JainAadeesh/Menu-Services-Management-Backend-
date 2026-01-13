const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
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
      validate: {
        validator: function (value) {
          if (
            this.tax_applicable === true &&
            (value === null || value === undefined)
          ) {
            return false;
          }
          return true;
        },
        message: "Tax percentage is required when tax is applicable",
      },
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
// Compound unique index
subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);
