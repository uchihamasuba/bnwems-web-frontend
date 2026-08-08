import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h3>
      <p className="text-gray-500 mb-8 max-w-md">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
