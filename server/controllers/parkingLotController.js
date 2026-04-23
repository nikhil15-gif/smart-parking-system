const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');

// @desc    Get all parking lots
// @route   GET /api/parking-lots
// @access  Public
const getParkingLots = async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find({});
    res.json(parkingLots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single parking lot with slots
// @route   GET /api/parking-lots/:id
// @access  Public
const getParkingLotById = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const slots = await Slot.find({ parkingLotId: parkingLot._id }).sort('slotNumber');

    res.json({
      ...parkingLot._doc,
      slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a parking lot
// @route   POST /api/parking-lots
// @access  Private/Admin
const createParkingLot = async (req, res) => {
  try {
    const { name, latitude, longitude, address, totalSlots, pricePerHour } = req.body;

    const parkingLot = await ParkingLot.create({
      name,
      location: { latitude, longitude, address },
      totalSlots,
      availableSlots: totalSlots,
      pricePerHour,
    });

    // Generate slots for this parking lot
    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        parkingLotId: parkingLot._id,
        slotNumber: `A${i}`,
        isOccupied: false,
      });
    }

    await Slot.insertMany(slots);

    res.status(201).json(parkingLot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a parking lot
// @route   DELETE /api/parking-lots/:id
// @access  Private/Admin
const deleteParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (parkingLot) {
      await Slot.deleteMany({ parkingLotId: parkingLot._id });
      await parkingLot.deleteOne();
      res.json({ message: 'Parking lot removed' });
    } else {
      res.status(404).json({ message: 'Parking lot not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a parking lot
// @route   PUT /api/parking-lots/:id
// @access  Private/Admin
const updateParkingLot = async (req, res) => {
  try {
    const { name, latitude, longitude, address, pricePerHour } = req.body;
    
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (parkingLot) {
      parkingLot.name = name || parkingLot.name;
      parkingLot.pricePerHour = pricePerHour || parkingLot.pricePerHour;
      
      if (latitude && longitude && address) {
        parkingLot.location = { latitude, longitude, address };
      }

      const updatedParkingLot = await parkingLot.save();
      res.json(updatedParkingLot);
    } else {
      res.status(404).json({ message: 'Parking lot not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getParkingLots,
  getParkingLotById,
  createParkingLot,
  deleteParkingLot,
  updateParkingLot,
};
