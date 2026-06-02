const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_AUDIO_UPLOAD_BYTES = 20 * 1024 * 1024;

function formatMb(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)}MB`;
}

function hasAllowedExtension(fileName: string, allowedExtensions: string[]) {
  const lowered = fileName.toLowerCase();
  return allowedExtensions.some((extension) => lowered.endsWith(extension));
}

export function validateImageUploadFile(file: File) {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return "JPG, PNG, WEBP 이미지 파일만 업로드할 수 있습니다.";
  }

  if (!hasAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
    return "이미지 파일 확장자를 확인해 주세요.";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return `이미지는 ${formatMb(MAX_IMAGE_UPLOAD_BYTES)} 이하로 업로드해 주세요.`;
  }

  return "";
}

export function validateAudioUploadFile(file: File) {
  if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
    return `음성 파일은 ${formatMb(MAX_AUDIO_UPLOAD_BYTES)} 이하로 녹음해 주세요.`;
  }

  return "";
}
