const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true,
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    address: {
      type: String,
      required: [true, 'Physical address is required'],
      trim: true,
    }
  },
  totalSlots: {
    type: Number,
    required: [true, 'Total number of slots must be defined'],
    min: [1, 'Must have at least 1 slot'],
  },
  availableSlots: {
    type: Number,
    required: true,
    min: 0,
    default: function() { return this.totalSlots; }
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Pricing is required'],
    min: [0, 'Price cannot be negative'],
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to populate slots without storing them in the same collection
parkingLotSchema.virtual('slots', {
  ref: 'Slot',
  localField: '_id',
  foreignField: 'parkingLotId'
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
