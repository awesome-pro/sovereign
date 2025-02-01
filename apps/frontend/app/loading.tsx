// components/Loading.tsx
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Spinner with a modern, minimal animation */}
      <svg
        className="animate-spin h-16 w-16 text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      {/* Branded loading text */}
      <h2 className="mt-6 text-2xl font-semibold text-gray-800">
        Loading Estate CRM...
      </h2>
      <p className="mt-2 text-gray-600">
        Please wait while we prepare your experience.
      </p>
    </div>
  );
}
