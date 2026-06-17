"use client";

import React from "react";

interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  type?: React.HTMLInputTypeAttribute;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  min?: string;
  max?: string;
  step?: string;
  accept?: string;
}

export default function Input({
  label,
  error,
  hint,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  name,
  id,
  className = "",
  min,
  max,
  step,
  accept,
}: InputProps) {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        accept={accept}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
