import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverEffect = true, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { y: -5 } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
