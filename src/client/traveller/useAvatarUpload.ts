import { useState } from 'react';
import { errorMessage } from '@/client/api/http';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/client/api/uploadApi';
import { userApi } from '@/client/api/userApi';
import type { ClientUser } from '@/client/api/types';
import { useClientAuth } from '@/client/auth/clientAuthContext';

/**
 * Đổi / gỡ ảnh đại diện: gọi API rồi cập nhật người dùng đang đăng nhập ngay,
 * nên ảnh trên top bar và mọi nơi khác đổi theo luôn (du khách và đối tác dùng chung tài khoản).
 */
export function useAvatarUpload(onChanged?: (user: ClientUser) => void) {
  const { updateUser } = useClientAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<ClientUser>) => {
    setUploading(true);
    setError(null);
    try {
      const updated = await action();
      updateUser(updated);
      onChanged?.(updated);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setUploading(false);
    }
  };

  const upload = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Chỉ nhận ảnh JPG, PNG hoặc WEBP');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Ảnh tối đa 5MB');
      return;
    }
    void run(() => userApi.uploadAvatar(file));
  };

  const remove = () => void run(() => userApi.removeAvatar());

  return { uploading, error, upload, remove };
}
