const BookingService = require("../services/BookingService");
const Booking = require("../models/Booking");
const {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require("../config/constants");

exports.getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const availability = await BookingService.getAvailableSlots(id, date);

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { itemId, userId, booking_date, start_time, end_time, quantity } =
      req.body;

    const bookingDate = new Date(booking_date);

    const booking = await BookingService.bookSlot(
      itemId,
      userId || "507f1f77bcf86cd799439012", // Demo user ID
      bookingDate,
      start_time,
      end_time,
      quantity
    );

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = Math.min(
      parseInt(req.query.limit) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.itemId) {
      filter.itemId = req.query.itemId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("itemId", "name")
        .sort({ booking_date: -1, start_time: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || "507f1f77bcf86cd799439012"; // Demo user ID

    const booking = await BookingService.cancelBooking(id, userId);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
