export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">Chi tiết khách hàng</h1>
      <p className="mt-1 text-sm text-slate-500">Mã khách hàng: {id} — Tính năng đang được phát triển.</p>
    </div>
  );
}
