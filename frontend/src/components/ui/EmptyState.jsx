export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl">
        ◇
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-surface-700 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
