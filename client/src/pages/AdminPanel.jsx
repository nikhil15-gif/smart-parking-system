import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MapPin, Database, RefreshCw, Edit, X, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/Map/MapComponent';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);

  // New lot form state
  const [showForm, setShowForm] = useState(false);
  const [editingLotId, setEditingLotId] = useState(null);
  const [newLot, setNewLot] = useState({
    name: '',
    latitude: 12.9716, // Default to Bangalore
    longitude: 77.5946,
    address: '',
    totalSlots: 20,
    pricePerHour: 5
  });

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!newLot.address) return;
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newLot.address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setNewLot(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
      } else {
        alert("Couldn't find coordinates for this address. Please try a more specific address or use the map to set location.");
      }
    } catch (error) {
      console.error("Geocoding error", error);
      alert("Error fetching coordinates.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapLocationSelect = (coords) => {
    setNewLot(prev => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude
    }));
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    } else if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/parking-lots');
      setParkingLots(data);
    } catch (error) {
      console.error('Error fetching parking lots', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchParkingLots();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLotId) {
        await axios.put(`/parking-lots/${editingLotId}`, newLot);
      } else {
        await axios.post('/parking-lots', newLot);
      }
      setShowForm(false);
      setEditingLotId(null);
      fetchParkingLots();
      // Reset form
      setNewLot({
        name: '',
        latitude: 12.9716,
        longitude: 77.5946,
        address: '',
        totalSlots: 20,
        pricePerHour: 5
      });
    } catch (error) {
      console.error('Error saving parking lot', error);
      alert(error.response?.data?.message || 'Error saving lot');
    }
  };

  const handleEditClick = (lot) => {
    setNewLot({
      name: lot.name,
      latitude: lot.location.latitude,
      longitude: lot.location.longitude,
      address: lot.location.address,
      totalSlots: lot.totalSlots,
      pricePerHour: lot.pricePerHour
    });
    setEditingLotId(lot._id);
    setShowForm(true);
  };

  const handleDeleteLot = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking lot and all its slots?')) {
      try {
        await axios.delete(`/parking-lots/${id}`);
        fetchParkingLots();
      } catch (error) {
        console.error('Error deleting parking lot', error);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-outfit font-extrabold text-slate-900 tracking-tight mb-2">System <span className="text-amber-500">Management</span></h1>
          <p className="text-slate-500 font-medium">Create, update, and manage your global parking network.</p>
        </div>
        
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingLotId(null);
              setNewLot({ name: '', latitude: 12.9716, longitude: 77.5946, address: '', totalSlots: 20, pricePerHour: 5 });
            } else {
              setShowForm(true);
            }
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl
            ${showForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100'}
          `}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Discard Changes' : 'Register New Lot'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12"
          >
            {/* Form Column */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                   <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                      <LayoutGrid size={20} />
                   </div>
                   <h2 className="text-xl font-outfit font-bold text-slate-900">{editingLotId ? 'Update Information' : 'Lot Details'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Location Name</label>
                    <input 
                      required type="text" 
                      value={newLot.name} 
                      onChange={e => setNewLot({...newLot, name: e.target.value})}
                      className="input-field py-2.5 text-sm"
                      placeholder="e.g. Grand Central Underground"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Physical Address</label>
                    <div className="flex gap-2">
                      <input 
                        required type="text" 
                        value={newLot.address} 
                        onChange={e => setNewLot({...newLot, address: e.target.value})}
                        className="input-field py-2.5 text-sm"
                        placeholder="Street, City, Zip"
                      />
                      <button
                        type="button"
                        onClick={handleGeocode}
                        disabled={isGeocoding || !newLot.address}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {isGeocoding ? '...' : 'Find'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Latitude</label>
                      <input 
                        required type="number" step="any"
                        value={newLot.latitude} 
                        onChange={e => setNewLot({...newLot, latitude: Number(e.target.value)})}
                        className="input-field py-2.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Longitude</label>
                      <input 
                        required type="number" step="any"
                        value={newLot.longitude} 
                        onChange={e => setNewLot({...newLot, longitude: Number(e.target.value)})}
                        className="input-field py-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                        Capacity {editingLotId && <span className="text-[8px] text-rose-500 ml-1">(Locked)</span>}
                      </label>
                      <input 
                        required type="number" min="1"
                        disabled={!!editingLotId}
                        value={newLot.totalSlots} 
                        onChange={e => setNewLot({...newLot, totalSlots: Number(e.target.value)})}
                        className="input-field py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Price / Hour ($)</label>
                      <input 
                        required type="number" min="0" step="0.01"
                        value={newLot.pricePerHour} 
                        onChange={e => setNewLot({...newLot, pricePerHour: Number(e.target.value)})}
                        className="input-field py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                      {editingLotId ? <RefreshCw size={18} /> : <CheckCircle2 size={18} />}
                      {editingLotId ? 'Update Registry' : 'Initialize Infrastructure'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Map Selection Column */}
            <div className="lg:col-span-7 h-[500px] lg:h-auto min-h-[400px]">
              <MapComponent 
                mode="select"
                parkingLots={parkingLots}
                initialLocation={{ latitude: newLot.latitude, longitude: newLot.longitude }}
                onLocationSelect={handleMapLocationSelect}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl"><MapPin size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Lots</p>
               <p className="text-2xl font-outfit font-bold text-slate-900">{parkingLots.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><Database size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Capacity</p>
               <p className="text-2xl font-outfit font-bold text-slate-900">{parkingLots.reduce((acc, lot) => acc + lot.totalSlots, 0)}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><CheckCircle2 size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Units</p>
               <p className="text-2xl font-outfit font-bold text-slate-900">{parkingLots.reduce((acc, lot) => acc + lot.availableSlots, 0)}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-violet-50 text-violet-600 p-3 rounded-2xl"><RefreshCw size={24} /></div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Health</p>
               <p className="text-2xl font-outfit font-bold text-slate-900">100%</p>
            </div>
         </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-outfit font-bold text-lg text-slate-900 tracking-tight">Active Infrastructure Registry</h3>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white border border-slate-100 rounded-full">
              Live Feed Connected
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Parking Asset</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Units (Avail/Total)</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tariff/hr</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {parkingLots.map((lot) => (
                <tr key={lot._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{lot.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium"><MapPin size={12}/> {lot.location?.address || 'Address not set'}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                         <div 
                           className={`h-full rounded-full ${lot.availableSlots > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                           style={{ width: `${(lot.availableSlots / lot.totalSlots) * 100}%` }}
                         />
                      </div>
                      <span className="font-black text-slate-700 text-sm">{lot.availableSlots}</span>
                      <span className="text-slate-400 text-xs font-bold">/ {lot.totalSlots}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-black text-slate-900 text-xs">
                      ${lot.pricePerHour.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(lot)}
                        className="text-slate-400 hover:text-amber-500 bg-white hover:bg-amber-50 p-2.5 rounded-2xl border border-slate-100 transition-all shadow-sm"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLot(lot._id)}
                        className="text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 p-2.5 rounded-2xl border border-slate-100 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {parkingLots.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                       <MapPin size={48} className="text-slate-300 mb-4" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Infrastructure Recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
