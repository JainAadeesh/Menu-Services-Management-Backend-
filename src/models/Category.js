const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
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
      default: false,
    },
    tax_percentage: {
      type: Number,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"],
      validate: {
        validator: function (value) {
          if (this.tax_applicable && (value === null || value === undefined)) {
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
categorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
