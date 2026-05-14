import { Inbox } from 'lucide-react';

function EmptyState({ title, description, action }) {
  return (
    <div className="glass-card rounded-[2rem] border border-white/10 p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/15 text-violet-200">
        <Inbox size={20} />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
