import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, Layer } from 'react-map-gl';
import { MapPin, Navigation, Info, ArrowRight, Star, Moon, Sun, Target, MousePointer2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = ({ 
  parkingLots = [], 
  selectedLotId = null, 
  mode = 'view', // 'view' or 'select'
  onLocationSelect = null,
  initialLocation = null 
}) => {
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
  const [marker, setMarker] = useState(initialLocation);
  const mapRef = useRef();
  const navigate = useNavigate();

  // Update marker if initialLocation changes (e.g., when editing)
  useEffect(() => {
    if (initialLocation) {
      setMarker(initialLocation);
    }
  }, [initialLocation]);

  // Fly to selected lot when it changes (from sidebar)
  useEffect(() => {
    if (selectedLotId && mapRef.current) {
      const lot = parkingLots.find(l => l._id === selectedLotId);
      if (lot) {
        mapRef.current.flyTo({
          center: [lot.location.longitude, lot.location.latitude],
          zoom: 15,
          duration: 2000,
          essential: true
        });
        setPopupInfo(lot);
      }
    }
  }, [selectedLotId, parkingLots]);

  const handleMapClick = (e) => {
    if (mode === 'select' && onLocationSelect) {
      const { lng, lat } = e.lngLat;
      setMarker({ latitude: lat, longitude: lng });
      onLocationSelect({ latitude: lat, longitude: lng });
    }
  };

  const pins = useMemo(
    () =>
      parkingLots.map((lot, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={lot.location.longitude}
          latitude={lot.location.latitude}
          anchor="bottom"
          onClick={e => {
            if (mode === 'view') {
              e.originalEvent.stopPropagation();
              setPopupInfo(lot);
            }
          }}
        >
          <div className="group relative cursor-pointer transform hover:scale-110 transition-all duration-300">
            {mode === 'view' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-xl border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <span className="text-[10px] font-bold text-slate-900">${lot.pricePerHour}/hr</span>
              </div>
            )}
            
            <div className={`relative p-2 rounded-full shadow-2xl ${lot.availableSlots > 0 ? 'bg-indigo-600' : 'bg-slate-500'} ring-4 ring-white transition-all duration-300`}>
              <MapPin size={24} className="text-white" fill="white" />
              {mode === 'view' && (
                <div className="absolute -top-1 -right-1 bg-white text-slate-900 text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                  {lot.availableSlots}
                </div>
              )}
            </div>
          </div>
        </Marker>
      )),
    [parkingLots, mode]
  );

  const toggleStyle = () => {
    setMapStyle(prev => {
      if (prev === 'mapbox://styles/mapbox/standard') return 'mapbox://styles/mapbox/dark-v11';
      if (prev === 'mapbox://styles/mapbox/dark-v11') return 'mapbox://styles/mapbox/satellite-streets-v12';
      return 'mapbox://styles/mapbox/standard';
    });
  };

  const recenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: marker ? [marker.longitude, marker.latitude] : [77.5946, 12.9716],
        zoom: marker ? 15 : 12,
        pitch: 45,
        bearing: -17.6,
        duration: 2000
      });
    }
  };

  return (
    <div className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl border border-white/50 relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialLocation?.longitude || 77.5946,
          latitude: initialLocation?.latitude || 12.9716,
          zoom: initialLocation ? 15 : 12,
          pitch: 45,
          bearing: -17.6
        }}
        onClick={handleMapClick}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        
        {pins}

        {/* Selection Mode Marker */}
        {mode === 'select' && marker && (
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            draggable
            onDragEnd={(e) => {
              const { lng, lat } = e.lngLat;
              setMarker({ latitude: lat, longitude: lng });
              onLocationSelect({ latitude: lat, longitude: lng });
            }}
          >
            <div className="relative transform scale-125">
              <MapPin size={32} className="text-amber-500 drop-shadow-2xl" fill="currentColor" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                DRAG ME
              </div>
            </div>
          </Marker>
        )}

        {popupInfo && mode === 'view' && (
          <Popup
            anchor="top"
            longitude={popupInfo.location.longitude}
            latitude={popupInfo.location.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            maxWidth="320px"
            className="premium-popup"
          >
            <div className="overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/20">
              <div className="relative h-24 bg-indigo-600 rounded-t-xl overflow-hidden mb-3">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-90" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <CarIcon size={40} className="text-white/20 -rotate-12" />
                 </div>
              </div>
              
              <div className="px-3 pb-3">
                <h3 className="font-outfit font-bold text-lg text-slate-900 leading-tight mb-0.5">{popupInfo.name}</h3>
                <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1">
                   <MapPin size={10} /> {popupInfo.location.address}
                </p>
                
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Price</p>
                    <p className="text-sm font-extrabold text-slate-900">${popupInfo.pricePerHour}/hr</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Slots</p>
                    <p className={`text-sm font-extrabold ${popupInfo.availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {popupInfo.availableSlots} Left
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/parking/${popupInfo._id}`)}
                  className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  Reserve Now <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Map Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
        <button 
          onClick={toggleStyle}
          className="bg-white/90 backdrop-blur shadow-xl p-3 rounded-2xl hover:bg-white transition-all text-slate-600 hover:text-indigo-600 border border-white group"
          title="Toggle Map Style"
        >
          {mapStyle.includes('light') ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button 
          onClick={recenter}
          className="bg-white/90 backdrop-blur shadow-xl p-3 rounded-2xl hover:bg-white transition-all text-slate-600 hover:text-indigo-600 border border-white group"
          title="Recenter Map"
        >
          <Target size={20} />
        </button>
      </div>

      {mode === 'select' && (
        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2">
           <MousePointer2 size={16} className="text-amber-500 animate-bounce" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Click or Drag to set location</p>
        </div>
      )}
    </div>
  );
};

const CarIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
  </svg>
);

export default MapComponent;
