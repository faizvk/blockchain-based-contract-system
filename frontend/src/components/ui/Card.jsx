import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "rounded-2xl bg-white border border-surface-200 shadow-sm",
        "transition hover:shadow-md",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={["px-5 sm:px-6 pt-5 sm:pt-6", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return (
    <div className={["px-5 sm:px-6 py-5", className].join(" ")}>{children}</div>
  );
}

export function CardFooter({ className = "", children }) {
  return (
    <div
      className={[
        "px-5 sm:px-6 py-4 border-t border-surface-100 bg-surface-50/50 rounded-b-2xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;
