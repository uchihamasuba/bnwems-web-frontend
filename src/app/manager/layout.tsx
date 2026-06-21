import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="Manager">
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
