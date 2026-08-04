import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  file?: File;
}

const CERTIFICATE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/*',
] as const;

const CHAT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/*',
] as const;

function guessMimeType(name: string, mimeType?: string | null): string {
  if (mimeType && mimeType !== 'application/octet-stream') return mimeType;
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return mimeType || 'application/octet-stream';
}

async function pickFileFromInput(accept: string): Promise<PickedFile | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        resolve({
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type || 'application/octet-stream',
          file,
        });
      };
      input.click();
    });
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [...CHAT_MIME_TYPES],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const asset = result.assets[0];
    const name = asset.name || `file-${Date.now()}.bin`;

    return {
      uri: asset.uri,
      name,
      type: guessMimeType(name, asset.mimeType),
    };
  } catch (error) {
    console.error('[pickFileFromInput]', error);
    return null;
  }
}

export async function pickCertificateFile(): Promise<PickedFile | null> {
  return pickFileFromInput('application/pdf,image/jpeg,image/png,image/webp');
}

export async function pickChatFile(): Promise<PickedFile | null> {
  return pickFileFromInput('application/pdf,image/jpeg,image/png,image/webp');
}

export function appendFileToFormData(formData: FormData, field: string, picked: PickedFile): void {
  if (picked.file) {
    formData.append(field, picked.file, picked.name);
    return;
  }
  formData.append(field, {
    uri: picked.uri,
    name: picked.name,
    type: picked.type,
  } as unknown as Blob);
}

export function isImageFile(fileUrl: string, mimeHint?: string | null): boolean {
  const lower = fileUrl.toLowerCase();
  if (mimeHint?.startsWith('image/')) return true;
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((ext) => lower.endsWith(ext));
}
