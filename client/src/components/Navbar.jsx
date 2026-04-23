import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Car, User, LogOut, Settings, LayoutDashboard, Map as MapIcon, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b ${isAdmin ? 'bg-slate-900/90 border-slate-800' : 'bg-white/70 border-slate-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group">
            <div className={`${isAdmin ? 'bg-amber-500' : 'bg-indigo-600'} p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
              {isAdmin ? <ShieldCheck size={24} /> : <Car size={24} strokeWidth={2.5} />}
            </div>
            <span className={`font-outfit font-bold text-xl tracking-tight ${isAdmin ? 'text-white' : 'text-slate-900'}`}>
              Smart<span className={isAdmin ? 'text-amber-500' : 'text-indigo-600'}>{isAdmin ? 'Admin' : 'Park'}</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            {user ? (
              <>
                {isAdmin ? (
                  // Admin Links
                  <>
                    <Link to="/admin" className="flex items-center gap-1.5 text-slate-300 hover:text-amber-500 font-medium transition-colors text-sm">
                      <Settings size={18} />
                      <span className="hidden md:inline">Management</span>
                    </Link>
                  </>
                ) : (
                  // User Links
                  <>
                    <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                      <MapIcon size={18} />
                      <span className="hidden md:inline">Find Parking</span>
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                      <LayoutDashboard size={18} />
                      <span className="hidden md:inline">My Bookings</span>
                    </Link>
                  </>
                )}
                
                <div className={`h-6 w-px mx-1 hidden md:block ${isAdmin ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                
                <div className="flex items-center gap-3 pl-2">
                  <div className="hidden sm:block text-right">
                    <p className={`text-xs font-semibold leading-none capitalize ${isAdmin ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                    <p className={`text-[10px] leading-none mt-1 uppercase tracking-wider ${isAdmin ? 'text-amber-500' : 'text-slate-500'}`}>{user.role}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className={`p-2 rounded-full transition-all duration-300 ${isAdmin ? 'text-slate-400 hover:text-amber-500 hover:bg-white/5' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 font-semibold hover:text-indigo-600 transition-colors text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
