const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/items/:id/availability", bookingController.getAvailability);
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
router.delete("/:id", bookingController.cancelBooking);

module.exports = router;
