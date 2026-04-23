import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import SlotGrid from '../components/ParkingLot/SlotGrid';
import BookingModal from '../components/Booking/BookingModal';
import { ArrowLeft, MapPin, Info, DollarSign, Database, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const [parkingLot, setParkingLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        const { data } = await axios.get(`/parking-lots/${id}`);
        setParkingLot(data);
      } catch (error) {
        console.error('Error fetching parking lot details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingLot();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('slotUpdated', (data) => {
        if (data.parkingLotId === id) {
          setParkingLot((prev) => {
            if (!prev) return prev;
            const updatedSlots = prev.slots.map(slot => 
              slot._id === data.slotId ? { ...slot, isOccupied: data.isOccupied } : slot
            );
            return {
              ...prev,
              slots: updatedSlots,
              availableSlots: prev.availableSlots + (data.isOccupied ? -1 : 1)
            };
          });
        }
      });
    }
    return () => {
      if (socket) socket.off('slotUpdated');
    };
  }, [socket, id]);

  const handleSelectSlot = (slot) => {
    if (!user) {
      navigate('/login', { state: { from: `/parking/${id}` } });
      return;
    }
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (bookingData) => {
    setBookingLoading(true);
    try {
      await axios.post('/bookings', bookingData);
      setIsModalOpen(false);
      setSelectedSlot(null);
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to book slot');
      alert(error.response?.data?.message || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
  
  if (!parkingLot) return (
    <div className="text-center py-20 px-4">
      <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Info className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Parking Lot Not Found</h2>
      <p className="text-slate-500 mt-2">The location you are looking for might have been moved or removed.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6">Go Back Home</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-fade-in">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all mb-8 font-bold text-sm uppercase tracking-widest group"
      >
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
          <ArrowLeft size={16} />
        </div>
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <h1 className="text-3xl font-outfit font-extrabold text-slate-900 leading-tight mb-4">{parkingLot.name}</h1>
            <p className="flex items-start gap-2 text-slate-500 font-medium text-sm mb-8 leading-relaxed">
              <MapPin size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" /> {parkingLot.location.address}
            </p>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                  <p className="text-lg font-outfit font-black text-slate-900">${parkingLot.pricePerHour}/hr</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                  <p className="text-lg font-outfit font-black text-slate-900">{parkingLot.availableSlots} <span className="text-slate-400 font-normal text-sm">/ {parkingLot.totalSlots}</span></p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
               <div className="flex items-center gap-2 text-indigo-600 mb-2">
                 <ShieldCheck size={18} />
                 <span className="font-bold text-xs uppercase tracking-widest">Verified Spot</span>
               </div>
               <p className="text-[13px] text-indigo-900/60 leading-relaxed font-medium">
                 This location is equipped with 24/7 security cameras and digital entry authorization.
               </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Slot Selection */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 h-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <h2 className="text-2xl font-outfit font-extrabold text-slate-900 tracking-tight">Select your spot</h2>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200 shadow-inner" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Empty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-200" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Selected</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/30 rounded-3xl p-6 md:p-8 border border-slate-100">
              <SlotGrid 
                slots={parkingLot.slots} 
                onSelectSlot={handleSelectSlot} 
                selectedSlot={selectedSlot}
              />
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
               <Info size={14} />
               <p className="text-[11px] font-medium italic">All bookings are subject to our terms of service and dynamic pricing.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <BookingModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleConfirmBooking}
            slot={selectedSlot}
            parkingLot={parkingLot}
            loading={bookingLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParkingDetails;
