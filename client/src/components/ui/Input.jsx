const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 outline-none transition-all duration-300
            placeholder:text-slate-400 text-slate-900 font-medium text-sm
            focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
            ${Icon ? 'pl-12 pr-4' : 'px-4'}
            ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-rose-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export default Input;
