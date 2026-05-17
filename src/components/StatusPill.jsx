import { classNames } from '../utils/helpers';

const styles = {
  paid: 'bg-emerald-500/15 text-emerald-200',
  approved: 'bg-sky-500/15 text-sky-200',
  partial: 'bg-amber-500/15 text-amber-200',
  unpaid: 'bg-slate-700/70 text-slate-200',
  locked: 'bg-rose-500/15 text-rose-200',
  pending: 'bg-slate-700/70 text-slate-200',
  'pending approval': 'bg-amber-500/15 text-amber-200',
  rejected: 'bg-rose-500/15 text-rose-200',
  'in-progress': 'bg-sky-500/15 text-sky-200',
  completed: 'bg-violet-500/15 text-violet-200',
  delivered: 'bg-violet-500/15 text-violet-200',
  new: 'bg-pink-500/15 text-pink-200',
  contacted: 'bg-sky-500/15 text-sky-200',
  closed: 'bg-slate-700/70 text-slate-200',
  draft: 'bg-slate-700/70 text-slate-200',
  default: 'bg-white/10 text-slate-200',
};

function StatusPill({ value }) {
  const key = String(value || 'default').toLowerCase();

  return (
    <span
      className={classNames(
        'inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize tracking-[0.14em]',
        styles[key] || styles.default
      )}
    >
      {String(value || 'N/A').replace('-', ' ')}
    </span>
  );
}

export default StatusPill;
