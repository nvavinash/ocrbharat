import axios from 'axios';

// Base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Upload an image to the backend for OCR processing.
 * @param {File} file - The image file to upload.
 * @param {Function} onProgress - Callback for upload progress (0-100).
 * @returns {Promise<Object>} - The OCR result JSON.
 */
export const uploadImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};
