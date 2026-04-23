import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Car, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const loggedInUser = await login(email, password);
      if (location.state?.from) {
        navigate(location.state.from);
      } else {
        navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 bg-slate-50/50">
      <Card className="max-w-md w-full p-10" hoverEffect={false}>
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto h-16 w-16 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-100"
          >
            <Car size={32} strokeWidth={2.5} />
          </motion.div>
          <h2 className="text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-slate-500 font-medium">Access your parking dashboard</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-100 text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <Input 
              label="Email Address"
              icon={Mail}
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Input 
              label="Password"
              icon={Lock}
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-sm uppercase tracking-widest"
            isLoading={isSubmitting}
          >
            Sign In <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-slate-50">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
