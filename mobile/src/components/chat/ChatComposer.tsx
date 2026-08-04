import { Pressable, Text, TextInput, View } from 'react-native';
import { AppLoader } from '../AppLoader';
import { AppIcon } from '../AppIcon';
import { UI } from '../../theme/ui';

interface ChatComposerProps {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  placeholder: string;
  sendLabel: string;
  sending?: boolean;
  disabled?: boolean;
  canSend?: boolean;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onAttach,
  placeholder,
  sendLabel,
  sending = false,
  disabled = false,
  canSend,
}: ChatComposerProps) {
  const ready = canSend ?? value.trim().length > 0;
  const sendEnabled = !disabled && !sending && ready;

  return (
    <View className="flex-row items-end gap-2">
      <Pressable
        onPress={onAttach}
        disabled={disabled || sending}
        className="mb-1 h-11 w-11 items-center justify-center rounded-full bg-slate-100 active:opacity-80"
      >
        <AppIcon name="attach" size={20} color={UI.primary} strokeWidth={2.25} />
      </Pressable>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        editable={!disabled && !sending}
        className="max-h-28 min-h-[44px] flex-1 rounded-card bg-slate-100 px-4 py-3 text-base text-slate-900"
        multiline
      />

      <Pressable
        onPress={onSend}
        disabled={!sendEnabled}
        className={`mb-1 rounded-card px-4 py-3 ${sendEnabled ? 'bg-primary' : 'bg-slate-300'}`}
      >
        {sending ? (
          <AppLoader size="small" />
        ) : (
          <Text className="font-semibold text-white">{sendLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}
