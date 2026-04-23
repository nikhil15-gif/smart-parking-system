import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MapComponent from '../components/Map/MapComponent';
import { Search, MapPin, Navigation, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

const Home = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLot, setActiveLot] = useState(null);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const { data } = await axios.get('/parking-lots');
        setParkingLots(data);
      } catch (error) {
        console.error('Error fetching parking lots', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParkingLots();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('slotUpdated', (data) => {
        setParkingLots((prevLots) => 
          prevLots.map(lot => {
            if (lot._id === data.parkingLotId) {
              const newAvailable = lot.availableSlots + (data.isOccupied ? -1 : 1);
              return { ...lot, availableSlots: Math.max(0, newAvailable) };
            }
            return lot;
          })
        );
      });
    }
    return () => {
      if (socket) socket.off('slotUpdated');
    };
  }, [socket]);

  const filteredLots = parkingLots.filter(lot => 
    lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lot.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      
      {/* Enhanced Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full md:w-[380px] bg-white border-r border-slate-200 z-20 flex flex-col h-full shadow-2xl relative"
      >
        {/* Search Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-outfit font-extrabold text-slate-900 tracking-tight">Explore</h1>
            <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {filteredLots.length} Found
            </div>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search parking by location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-100/50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          </div>
        </div>
        
        {/* Scrollable List */}
        <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4 scrollbar-hide">
          <AnimatePresence mode='popLayout'>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : filteredLots.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 px-4"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-700">No matches found</h3>
                <p className="text-slate-400 text-sm mt-1">Try searching for a different area or location name.</p>
              </motion.div>
            ) : (
              filteredLots.map((lot, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={lot._id} 
                  onMouseEnter={() => setActiveLot(lot._id)}
                  onClick={() => setActiveLot(lot._id)}
                  onMouseLeave={() => setActiveLot(null)}
                  className={`relative overflow-hidden bg-white border ${
                    activeLot === lot._id ? 'border-indigo-500 ring-2 ring-indigo-500/5 shadow-lg' : 'border-slate-100 shadow-sm'
                  } p-5 rounded-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-grow pr-2">
                      <h3 className="font-outfit font-bold text-lg text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {lot.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[13px] mt-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{lot.location.address}</span>
                      </div>
                    </div>
                    <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-100">
                      ${lot.pricePerHour}<span className="text-[10px] opacity-75 font-normal ml-0.5">/hr</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${lot.availableSlots > 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                      <span className={`text-[13px] font-bold ${lot.availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {lot.availableSlots} Slots left
                      </span>
                    </div>
                    <Link 
                      to={`/parking/${lot._id}`}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform"
                    >
                      BOOK NOW <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Enhanced Map Area */}
      <div className="flex-grow h-full bg-slate-100 relative group">
        {!loading && (
          <div className="w-full h-full">
            <MapComponent parkingLots={parkingLots} selectedLotId={activeLot} />
            
            {/* Map Floating UI */}
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button className="bg-white/90 backdrop-blur shadow-xl p-3 rounded-2xl hover:bg-white transition-all text-slate-600 hover:text-indigo-600 border border-white">
                <Navigation size={20} />
              </button>
              <button className="bg-white/90 backdrop-blur shadow-xl p-3 rounded-2xl hover:bg-white transition-all text-slate-600 hover:text-indigo-600 border border-white">
                <Info size={20} />
              </button>
            </div>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:hidden">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2">
                <MapPin size={20} /> List View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
