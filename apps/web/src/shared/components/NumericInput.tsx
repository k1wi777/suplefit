"use client";

import { useNumericInput } from "@/shared/hooks/useNumericInput";

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  allowDecimal?: boolean;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  allowDecimal = true,
  className = "",
  required,
  disabled,
  placeholder,
}: Props) {
  const { text, handleChange, handleBlur } = useNumericInput(value, onChange, {
    min,
    max,
    allowDecimal,
  });

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      className={className}
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      step={step}
    />
  );
}
