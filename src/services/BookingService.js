const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Item = require("../models/Item");
const { BOOKING_STATUS } = require("../config/constants");

class BookingService {
  async getAvailableSlots(itemId, date) {
    const item = await Item.findById(itemId);

    if (!item) {
      throw new Error("Item not found");
    }

    if (!item.is_bookable) {
      throw new Error("Item is not bookable");
    }

    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayName = dayNames[date.getDay()];

    if (!item.availability.days.includes(dayName)) {
      return {
        date: date,
        available: false,
        message: "Item is not available on this day",
        slots: [],
      };
    }

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      itemId,
      booking_date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: { $ne: BOOKING_STATUS.CANCELLED },
    });

    const availableSlots = [];

    for (const slot of item.availability.time_slots) {
      const conflictCount = this.countConflicts(
        existingBookings,
        slot.start_time,
        slot.end_time
      );

      const maxBookings = slot.max_concurrent_bookings || 1;
      const available = conflictCount < maxBookings;

      availableSlots.push({
        start_time: slot.start_time,
        end_time: slot.end_time,
        available,
        max_capacity: maxBookings,
        remaining_capacity: maxBookings - conflictCount,
        booked_count: conflictCount,
      });
    }

    return {
      date: date,
      day: dayName,
      slots: availableSlots,
    };
  }

  async bookSlot(
    itemId,
    userId,
    bookingDate,
    startTime,
    endTime,
    quantity = 1
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const item = await Item.findById(itemId).session(session);

      if (!item) {
        throw new Error("Item not found");
      }

      if (!item.is_bookable) {
        throw new Error("Item is not bookable");
      }

      // Validate day
      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[bookingDate.getDay()];

      if (!item.availability.days.includes(dayName)) {
        throw new Error("Item is not available on this day");
      }

      // Validate time slot
      const slot = item.availability.time_slots.find(
        (s) => s.start_time === startTime && s.end_time === endTime
      );

      if (!slot) {
        throw new Error("Invalid time slot");
      }

      // Check for conflicts with pessimistic locking
      const conflicts = await Booking.find({
        itemId,
        booking_date: {
          $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
        },
        status: { $ne: BOOKING_STATUS.CANCELLED },
        $or: [
          {
            start_time: { $lt: endTime },
            end_time: { $gt: startTime },
          },
        ],
      }).session(session);

      const maxBookings = slot.max_concurrent_bookings || 1;

      if (conflicts.length >= maxBookings) {
        throw new Error("Slot is fully booked");
      }

      const booking = await Booking.create(
        [
          {
            itemId,
            userId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            quantity,
            status: BOOKING_STATUS.CONFIRMED,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return booking[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized: You can only cancel your own bookings");
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new Error("Booking is already cancelled");
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    await booking.save();

    return booking;
  }

  countConflicts(bookings, startTime, endTime) {
    return bookings.filter((booking) => {
      return booking.start_time < endTime && booking.end_time > startTime;
    }).length;
  }
}

module.exports = new BookingService();
