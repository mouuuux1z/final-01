import { Image, Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../AppIcon';
import { MessageReadReceipts } from './MessageReadReceipts';
import { getApiBaseOrigin } from '../../constants/config';
import { isImageFile } from '../../utils/filePicker';
import type { ChatMessage } from '../../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  formatTime: (iso: string) => string;
}

function resolveFileUrl(fileUrl: string): string {
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  return `${getApiBaseOrigin()}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
}

export function ChatMessageBubble({ message, isOwn, formatTime }: ChatMessageBubbleProps) {
  const { t } = useTranslation();
  const fileUrl = message.fileUrl ?? null;
  const resolvedFileUrl = fileUrl ? resolveFileUrl(fileUrl) : null;
  const isImage = resolvedFileUrl ? isImageFile(resolvedFileUrl) : false;
  const isRead = Boolean(message.readAt);
  const showText = message.message.trim() && message.message.trim() !== '📎';

  const openFile = () => {
    if (!resolvedFileUrl) return;
    void Linking.openURL(resolvedFileUrl);
  };

  return (
    <View className={`mb-3 max-w-[85%] ${isOwn ? 'self-end' : 'self-start'}`}>
      <View
        className={`overflow-hidden rounded-card px-3 py-2.5 ${
          isOwn ? 'bg-primary' : 'bg-white border border-slate-100'
        }`}
      >
        {resolvedFileUrl && isImage ? (
          <Pressable onPress={openFile} className="mb-2">
            <Image
              source={{ uri: resolvedFileUrl }}
              className="h-44 w-56 max-w-full rounded-lg"
              resizeMode="cover"
            />
          </Pressable>
        ) : null}

        {resolvedFileUrl && !isImage ? (
          <Pressable
            onPress={openFile}
            className={`mb-2 flex-row items-center gap-2 rounded-lg px-3 py-2 ${
              isOwn ? 'bg-white/15' : 'bg-slate-50'
            }`}
          >
            <AppIcon name="attach" size={18} color={isOwn ? '#FFFFFF' : '#475569'} strokeWidth={2.25} />
            <Text className={`flex-1 text-sm ${isOwn ? 'text-white' : 'text-slate-700'}`} numberOfLines={1}>
              {t('chat.openAttachment')}
            </Text>
          </Pressable>
        ) : null}

        {showText ? (
          <Text className={`text-sm ${isOwn ? 'text-white' : 'text-slate-800'}`}>{message.message}</Text>
        ) : null}
      </View>

      <View
        className={`mt-1 flex-row items-center ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <Text className="text-[10px] text-slate-400">{formatTime(message.createdAt)}</Text>
        {isOwn ? <MessageReadReceipts read={isRead} /> : null}
      </View>
    </View>
  );
}
