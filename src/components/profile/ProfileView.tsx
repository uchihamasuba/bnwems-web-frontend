'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, Pencil } from 'lucide-react';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApiService } from '@/services/auth.service';
import type { AuthProfile } from '@/types/auth';

interface ProfileViewProps {
  infoHref: string;
  securityHref: string;
}

export function ProfileView({ infoHref, securityHref }: Readonly<ProfileViewProps>) {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80'); // Mocked avatar
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mocks based on mockup
  const mockEmail = 'minh.le@blissnetwork.vn';
  const mockPhone = '090 123 4567';

  // Extract base path, e.g., '/admin' from '/admin/profile'
  const basePath = infoHref.replace('/profile', '');

  useEffect(() => {
    authApiService.getProfile()
      .then((res) => {
        setProfile(res.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload this file to server via FormData API
      // Mocking local object URL preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(''); // Reset to default/empty
    // Add API call to remove avatar on server here
  };

  const handleSave = () => {
    // API call to save Bio
    console.log('Saved Bio:', bio);
    alert('Đã lưu thay đổi thông tin cá nhân!');
  };

  if (isLoading) {
    return (
      <ProfileLayout basePath={basePath}>
        <div className="flex h-64 items-center justify-center">
          <span className="text-slate-400 animate-pulse">Đang tải...</span>
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout basePath={basePath}>
      <div className="p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Ảnh đại diện</h2>
        
        <div className="flex items-center gap-6 border-b border-slate-100 pb-8">
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-200" 
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
                Trống
              </div>
            )}
            <button 
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/png, image/jpeg, image/gif"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
                Tải ảnh mới
              </Button>
              <Button variant="secondary" onClick={handleRemoveAvatar}>
                Xóa ảnh
              </Button>
            </div>
            <p className="text-sm text-slate-500">Định dạng JPG, GIF hoặc PNG. Kích thước tối đa 2MB.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6">
          <Input 
            label="Họ và tên" 
            value={profile?.fullName || ''} 
            disabled 
          />
          <Input 
            label="Email công việc" 
            value={mockEmail} 
            disabled 
            trailingIcon={<Lock className="h-4 w-4" />}
          />
          <Input 
            label="Số điện thoại" 
            value={mockPhone} 
            disabled 
          />
          <Input 
            label="Vai trò" 
            value={profile?.role?.roleName || ''} 
            disabled 
          />
          
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả ngắn (Bio)</label>
            <textarea 
              rows={4}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Viết vài dòng về bản thân bạn..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setBio('')}>Hủy thay đổi</Button>
          <Button variant="primary" onClick={handleSave}>Lưu thay đổi</Button>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default ProfileView;
