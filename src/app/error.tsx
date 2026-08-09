"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
          Đã có lỗi xảy ra!
        </h2>
        <p className="mb-8 text-gray-500">
          Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng thử lại sau.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-[#894D58] px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-[#a05a66] focus:outline-none focus:ring-2 focus:ring-[#894D58] focus:ring-offset-2"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
