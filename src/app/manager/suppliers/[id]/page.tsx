export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">Chi tiết nhà cung cấp</h1>
      <p className="mt-1 text-sm text-slate-500">Mã nhà cung cấp: {id} — Tính năng đang được phát triển.</p>
    </div>
  );
}
