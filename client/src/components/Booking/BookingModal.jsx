import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CreditCard, Calendar, Info, ShieldCheck, Ticket } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onConfirm, slot, parkingLot, loading }) => {
  const [duration, setDuration] = useState(1);

  if (!isOpen || !slot || !parkingLot) return null;

  const totalAmount = duration * parkingLot.pricePerHour;
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  const handleConfirm = () => {
    onConfirm({
      parkingLotId: parkingLot._id,
      slotId: slot._id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[32px] shadow-2xl shadow-indigo-900/20 max-w-md w-full overflow-hidden relative z-10 border border-white/20"
      >
        {/* Header Image Area */}
        <div className="h-24 bg-indigo-600 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700" />
           <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
           </div>
           
           <div className="absolute inset-0 flex items-center justify-between px-8">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                    <Ticket className="text-white" size={20} />
                 </div>
                 <h2 className="text-xl font-outfit font-bold text-white tracking-tight">Checkout</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={20} />
              </button>
           </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-grow pr-4">
              <h3 className="font-outfit font-bold text-xl text-slate-900 leading-tight mb-1">{parkingLot.name}</h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                 <MapPin size={10} /> {parkingLot.location.address}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl flex flex-col items-center flex-shrink-0 shadow-sm shadow-indigo-50">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Slot</p>
              <p className="text-xl font-outfit font-black text-indigo-600 leading-none">{slot.slotNumber}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Clock size={14} className="text-indigo-500" /> Reservation Time
                </label>
                <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded-lg text-xs font-bold">{duration} Hours</span>
              </div>
              
              <div className="relative pt-2 px-1">
                <input 
                  type="range" 
                  min="1" max="24" 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] font-bold text-slate-300">1h</span>
                  <span className="text-[10px] font-bold text-slate-300">12h</span>
                  <span className="text-[10px] font-bold text-slate-300">24h</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold flex items-center gap-2"><Calendar size={16} /> Date</span>
                <span className="font-bold text-slate-700">{startTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-bold flex items-center gap-2"><Clock size={16} /> Window</span>
                <span className="font-bold text-slate-700">
                  {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-200/50 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pay</p>
                   <p className="text-2xl font-outfit font-black text-slate-900">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-600/5 text-indigo-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                   <ShieldCheck size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={22} />
                  Confirm & Reserve
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 font-medium px-6 leading-relaxed">
               By confirming, you agree to our terms. Your reserved slot will be held for 15 minutes after start time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Internal MapPin icon for consistency
const MapPin = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default BookingModal;
