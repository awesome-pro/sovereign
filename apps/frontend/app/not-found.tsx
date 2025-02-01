// app/not-found.tsx (or pages/404.tsx if using the pages router)
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
      <p className="mt-4 text-3xl font-bold text-gray-800">Page Not Found</p>
      <p className="mt-2 text-lg text-gray-500">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/dashboard">
        <p className="mt-8 inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition">
          Back to Dashboard
        </p>
      </Link>
    </div>
  );
}
