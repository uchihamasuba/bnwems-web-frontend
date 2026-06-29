'use client';

import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

interface SecurityViewProps {
  infoHref: string;
  securityHref: string;
}

export function SecurityView({ infoHref }: Readonly<SecurityViewProps>) {
  // Extract base path, e.g., '/admin' from '/admin/profile'
  const basePath = infoHref.replace('/profile', '');

  return (
    <ProfileLayout basePath={basePath}>
      <div className="p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Thay đổi mật khẩu</h2>
        <div className="max-w-md">
          <ChangePasswordForm />
        </div>
      </div>
    </ProfileLayout>
  );
}

export default SecurityView;
