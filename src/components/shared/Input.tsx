import React, { ChangeEventHandler } from "react";

function Input({
  value,
  type,
  name,
  placeholder,
  autoFocus = false,
  onChange,
}: {
  value?: string;
  type?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      type={type ? type : 'text'}
      value={value}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full text-md sm:text-lg leading-none py-3 px-1 rounded-none text-gray-light bg-transparent outline-none border-b border-gray-light placeholder:text-gray-light"
    />
  );
}

export default Input;
