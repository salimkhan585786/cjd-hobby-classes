const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET || '';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const encodeHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

const sha1 = async (value) => {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-1', encoded);
  return encodeHex(digest);
};

const sanitizePublicId = (value = '') =>
  value
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '') || `upload-${Date.now()}`;

const buildSignaturePayload = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

export const uploadFile = async (path, file) => {
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is missing.');
  }

  if (!(file instanceof File)) {
    throw new Error('A valid file is required for upload.');
  }

  const normalizedPath = String(path || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const segments = normalizedPath.split('/').filter(Boolean);
  const fileName = segments.pop() || file.name || `upload-${Date.now()}`;
  const folder = segments.join('/');
  const publicId = sanitizePublicId(fileName);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();

  formData.append('file', file);

  if (folder) {
    formData.append('folder', folder);
  }

  formData.append('public_id', publicId);

  if (uploadPreset) {
    formData.append('upload_preset', uploadPreset);
  } else {
    if (!apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials are incomplete. Add an upload preset or API key and secret.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureParams = {
      folder,
      public_id: publicId,
      timestamp,
    };
    const signature = await sha1(`${buildSignaturePayload(signatureParams)}${apiSecret}`);

    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed.');
  }

  if (!payload?.secure_url) {
    throw new Error('Cloudinary did not return a secure URL.');
  }

  return payload.secure_url;
};
