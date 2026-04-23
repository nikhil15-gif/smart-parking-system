const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ParkingLot = require('../models/ParkingLot');
const QRCode = require('qrcode');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { parkingLotId, slotId, startTime, endTime } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isOccupied) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Calculate total amount (simplified)
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalAmount = hours * parkingLot.pricePerHour;

    const booking = new Booking({
      userId: req.user._id,
      parkingLotId,
      slotId,
      startTime,
      endTime,
      totalAmount,
      status: 'confirmed',
    });

    // Generate QR Code containing booking ID
    const qrData = JSON.stringify({ bookingId: booking._id });
    const qrCodeImage = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCodeImage;

    await booking.save();

    // Mark slot as occupied
    slot.isOccupied = true;
    await slot.save();

    // Update parking lot available slots
    parkingLot.availableSlots -= 1;
    await parkingLot.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('slotUpdated', { parkingLotId, slotId, isOccupied: true });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('parkingLotId', 'name location')
      .populate('slotId', 'slotNumber')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update booking status (e.g. complete or cancel)
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // If completed or cancelled, free the slot
    if (status === 'completed' || status === 'cancelled') {
      const slot = await Slot.findById(booking.slotId);
      if (slot) {
        slot.isOccupied = false;
        await slot.save();

        const parkingLot = await ParkingLot.findById(booking.parkingLotId);
        if (parkingLot) {
          parkingLot.availableSlots += 1;
          await parkingLot.save();
        }

        // Emit socket event
        const io = req.app.get('io');
        io.emit('slotUpdated', { parkingLotId: booking.parkingLotId, slotId: slot._id, isOccupied: false });
      }
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('parkingLotId', 'name')
      .populate('slotId', 'slotNumber')
      .sort('-createdAt');
    
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  updateBookingStatus,
  getAllBookings,
};
