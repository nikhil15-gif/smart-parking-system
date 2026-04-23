import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, ArrowRight, QrCode, Trash2, Ticket } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/bookings/mybookings');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      } catch (error) {
        console.error('Error cancelling booking', error);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Fetching your tickets...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-outfit font-extrabold text-slate-900 tracking-tight mb-2">
            Hello, <span className="text-indigo-600 capitalize">{user?.name}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium">Manage your active reservations and entry permits.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Bookings</p>
            <p className="text-2xl font-outfit font-bold text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 text-center text-white">
            <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Active</p>
            <p className="text-2xl font-outfit font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>
      </motion.div>

      {bookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-16 text-center max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Ticket size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-outfit font-bold text-slate-900 mb-4">Your garage is empty!</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
            Ready to secure your spot in the city? Discover real-time availability on our interactive map.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg">
            Find Parking Now <ArrowRight size={20} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {bookings.map((booking, index) => {
              const isConfirmed = booking.status === 'confirmed';
              const startDate = new Date(booking.startTime);
              const endDate = new Date(booking.endTime);
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={booking._id} 
                  className={`group bg-white rounded-[32px] border transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50 overflow-hidden relative flex flex-col
                    ${isConfirmed ? 'border-slate-100' : 'border-slate-100 opacity-80'}
                  `}
                >
                  {/* Status Overlay */}
                  <div className={`absolute top-6 right-6 px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-tighter flex items-center gap-1.5 z-10 shadow-sm
                    ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'completed' ? 'bg-slate-100 text-slate-600' : 
                      'bg-rose-100 text-rose-700'}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                    {booking.status}
                  </div>

                  <div className="p-8 pb-4 flex-grow">
                    <div className="mb-6">
                      <h3 className="font-outfit font-bold text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors pr-20 line-clamp-1">
                        {booking.parkingLotId?.name || 'Smart Parking Lot'}
                      </h3>
                      <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-2 font-medium">
                        <MapPin size={14} className="text-indigo-500" /> {booking.parkingLotId?.location?.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Entry Slot</p>
                        <p className="text-xl font-outfit font-black text-indigo-600">{booking.slotId?.slotNumber}</p>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Fare</p>
                        <p className="text-xl font-outfit font-black text-slate-900">${booking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reservation Date</p>
                          <p className="text-sm font-bold text-slate-700">{startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Window</p>
                          <p className="text-sm font-bold text-slate-700">
                            {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isConfirmed && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
                      {booking.qrCode ? (
                        <div className="flex items-center gap-6">
                          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                            <img src={booking.qrCode} alt="QR Code" className="w-20 h-20 mix-blend-multiply" />
                          </div>
                          <div className="flex-grow">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                               <QrCode size={12} /> Entry Ticket
                             </p>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">
                               Scan this code at the gate to authorize entry.
                             </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-slate-400">
                           <Clock size={20} />
                           <p className="text-sm font-medium">QR generating...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isConfirmed && (
                    <div className="p-4 bg-white mt-auto">
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-rose-600 font-bold text-xs uppercase tracking-widest py-3 rounded-2xl hover:bg-rose-50 transition-all duration-300"
                      >
                        <Trash2 size={14} /> Cancel Reservation
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
