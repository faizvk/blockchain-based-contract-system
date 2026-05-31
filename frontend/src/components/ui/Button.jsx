import React from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const variants = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:shadow-brand-700/30",
  secondary:
    "bg-white text-surface-900 border border-surface-200 hover:bg-surface-50 hover:border-surface-300",
  ghost: "bg-transparent text-surface-700 hover:bg-surface-100",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700",
  success:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const Button = React.forwardRef(function Button(
  {
    as: Comp = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
    type,
    children,
    ...props
  },
  ref
) {
  // Default to type="button" when rendering a real <button> so we never
  // accidentally submit an ancestor <form>.
  const resolvedType = Comp === "button" ? type ?? "button" : type;
  return (
    <Comp
      ref={ref}
      type={resolvedType}
      className={[
        base,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Comp>
  );
});

export default Button;
