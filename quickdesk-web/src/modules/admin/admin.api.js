// import api from '../../core/api';
// import api from '../core/hooks';

import { axiosInstance } from "../../lib/axios";



export const uploadKnowledgeDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post('/knowledge/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};
