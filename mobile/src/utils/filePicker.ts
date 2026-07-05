import { Platform } from 'react-native';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  file?: File;
}

export async function pickCertificateFile(): Promise<PickedFile | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/jpeg,image/png,image/webp';
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

  return null;
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
