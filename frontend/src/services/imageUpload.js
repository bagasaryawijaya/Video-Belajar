import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/courses';
const API_ROOT = API_URL.replace(/\/courses\/?$/, '');

const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export async function uploadImage(file, folder = 'images') {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');
  const imageData = await toDataUrl(file);
  const response = await axios.post(`${API_ROOT}/uploads`, { imageData, originalName: file.name, folder }, { timeout: 30000 });
  return response.data?.data;
}
