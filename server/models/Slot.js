const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Ensure unique slot numbers within a parking lot
slotSchema.index({ parkingLotId: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
