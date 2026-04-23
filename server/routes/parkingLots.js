const express = require('express');
const router = express.Router();
const {
  getParkingLots,
  getParkingLotById,
  createParkingLot,
  deleteParkingLot,
  updateParkingLot,
} = require('../controllers/parkingLotController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getParkingLots)
  .post(protect, admin, createParkingLot);

router.route('/:id')
  .get(getParkingLotById)
  .put(protect, admin, updateParkingLot)
  .delete(protect, admin, deleteParkingLot);

module.exports = router;
