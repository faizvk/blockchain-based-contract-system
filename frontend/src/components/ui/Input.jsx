import React from "react";

const Input = React.forwardRef(function Input(
  { label, hint, error, className = "", id, ...props },
  ref
) {
  const inputId = id || (label ? `f-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "block w-full h-11 px-3.5 rounded-xl bg-white",
          "border border-surface-200 text-surface-900 placeholder:text-surface-300",
          "shadow-sm transition",
          "focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none",
          "disabled:bg-surface-50 disabled:text-surface-700",
          error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-surface-700/70">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
