import { View } from 'react-native';
import { AppIcon } from '../AppIcon';
import { UI } from '../../theme/ui';

const READ_COLOR = UI.primary;
const UNREAD_COLOR = '#94A3B8';

interface MessageReadReceiptsProps {
  read: boolean;
}

export function MessageReadReceipts({ read }: MessageReadReceiptsProps) {
  return (
    <View className="ml-1">
      <AppIcon name="readReceipt" size={14} color={read ? READ_COLOR : UNREAD_COLOR} strokeWidth={2.5} />
    </View>
  );
}
