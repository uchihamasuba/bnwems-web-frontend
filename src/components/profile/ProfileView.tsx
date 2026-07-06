'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, Pencil } from 'lucide-react';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApiService } from '@/services/auth.service';
import { userApiService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import type { AuthProfile } from '@/types/auth';

interface ProfileViewProps {
  infoHref: string;
  securityHref: string;
}

export function ProfileView({ infoHref, securityHref }: Readonly<ProfileViewProps>) {
  const { token, login } = useAuth();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
        setBio(res.data.bio || '');
        setAvatarUrl(res.data.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80');
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarUrl('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let finalAvatarUrl = avatarUrl;
      
      // If a new file is selected, upload it first
      if (selectedFile && profile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await userApiService.updateAvatar(profile.userId, formData);
        finalAvatarUrl = uploadRes.data.avatarUrl || uploadRes.data;
        setAvatarUrl(finalAvatarUrl);
      }
      
      await authApiService.updateProfile({
        bio,
        avatarUrl: finalAvatarUrl,
        fullName,
        phone,
      });
      
      setProfile(prev => prev ? { ...prev, bio, avatarUrl: finalAvatarUrl, fullName, phone } : null);
      setSelectedFile(null);

      // Re-fetch the full profile and update AuthContext so the Header avatar reflects the change
      try {
        const freshProfile = await authApiService.getProfile();
        if (token) {
          login(token, freshProfile.data);
        }
      } catch {
        // Non-critical: context update failed, UI already updated locally
      }

      alert('Đã lưu thay đổi thông tin cá nhân!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
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
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input 
            label="Email công việc" 
            value={profile?.email || mockEmail} 
            disabled 
            trailingIcon={<Lock className="h-4 w-4" />}
          />
          <Input 
            label="Số điện thoại" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input 
            label="Vai trò" 
            value={typeof profile?.role === 'object' ? (profile?.role as any).roleName : profile?.role || ''} 
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
          <Button variant="secondary" onClick={() => {
            setBio(profile?.bio || '');
            setAvatarUrl(profile?.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80');
            setFullName(profile?.fullName || '');
            setPhone(profile?.phone || '');
            setSelectedFile(null);
          }} disabled={isSaving}>Hủy thay đổi</Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </ProfileLayout>
  );
}

export default ProfileView;
