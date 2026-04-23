const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route('/mybookings')
  .get(protect, getUserBookings);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

module.exports = router;
