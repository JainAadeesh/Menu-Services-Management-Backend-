const mongoose = require("mongoose");
const { BOOKING_STATUS } = require("../config/constants");

const bookingSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      index: true,
    },
    booking_date: {
      type: Date,
      required: [true, "Booking date is required"],
      index: true,
    },
    start_time: {
      type: String,
      required: [true, "Start time is required"],
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    end_time: {
      type: String,
      required: [true, "End time is required"],
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for conflict detection
bookingSchema.index({ itemId: 1, booking_date: 1, start_time: 1, end_time: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ itemId: 1, status: 1, booking_date: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
