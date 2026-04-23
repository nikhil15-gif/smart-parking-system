import { Car } from 'lucide-react';
import { motion } from 'framer-motion';

const SlotGrid = ({ slots, onSelectSlot, selectedSlot }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {slots.map((slot, index) => {
        const isAvailable = !slot.isOccupied;
        const isSelected = selectedSlot?._id === slot._id;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01, duration: 0.3 }}
            key={slot._id}
            onClick={() => isAvailable && onSelectSlot(slot)}
            className={`
              relative group flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300
              ${!isAvailable 
                ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60' 
                : isSelected 
                  ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200 transform scale-105 z-10' 
                  : 'bg-white border-slate-100 hover:border-indigo-200 cursor-pointer hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1'}
            `}
          >
            {/* Slot Indicator */}
            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${!isAvailable ? 'bg-rose-500' : isSelected ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
            
            <span className={`text-[10px] font-black mb-3 tracking-widest uppercase transition-colors
              ${!isAvailable ? 'text-slate-400' : isSelected ? 'text-white/80' : 'text-slate-400 group-hover:text-indigo-600'}
            `}>
              {slot.slotNumber}
            </span>
            
            <div className={`transition-all duration-300 transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
              <Car 
                size={28} 
                className={`transition-colors duration-300 
                  ${!isAvailable ? 'text-slate-300' : isSelected ? 'text-white' : 'text-slate-300 group-hover:text-indigo-500'}
                `} 
              />
            </div>

            {!isAvailable && (
              <div className="absolute inset-0 bg-slate-900/5 rounded-3xl flex items-center justify-center">
                 <div className="bg-rose-500/10 backdrop-blur-[1px] px-2 py-0.5 rounded-full rotate-[-12deg]">
                   <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Occupied</span>
                 </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SlotGrid;
