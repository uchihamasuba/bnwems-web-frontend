import api from './api';

export interface UploadImageResponse {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const uploadApiService = {
  /** POST /api/v1/upload/image */
  async uploadImage(file: File, folder: string = 'general'): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
