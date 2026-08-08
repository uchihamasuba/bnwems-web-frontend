"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã có lỗi xảy ra!</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Xin lỗi, hệ thống đã gặp sự cố khi tải dữ liệu. Vui lòng thử lại hoặc trở về trang chủ.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
