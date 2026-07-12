import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BACKGROUNDS, UI } from '../theme/ui';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/** Isolates a single tab/screen crash so other tabs keep working. */
export class TabScreenErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'Unexpected error',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[TabScreenErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: BACKGROUNDS.meshSky.base }}
        >
          <Text className="mb-2 text-center text-xl font-bold text-on-sky">
            {this.props.title ?? 'Screen error'}
          </Text>
          <Text className="mb-6 text-center text-sm text-on-sky-muted">{this.state.message}</Text>
          <Pressable
            onPress={this.handleRetry}
            className="rounded-pill px-5 py-3"
            style={{ backgroundColor: UI.primary }}
          >
            <Text className="text-sm font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
