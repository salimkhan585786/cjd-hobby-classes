import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div layout className="glass-card overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 text-left text-slate-100"
      >
        <span className="text-lg font-semibold">{question}</span>
        <ChevronDown className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-4 text-slate-300">{answer}</p>}
    </motion.div>
  );
}

export default FAQItem;
