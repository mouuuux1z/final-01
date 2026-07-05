declare module 'expo-barcode-generator' {
  import type { ComponentType } from 'react';

  export interface BarcodeOptions {
    format?: string;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontOptions?: string;
    text?: string;
    textAlign?: 'left' | 'center' | 'right';
    textPosition?: 'top' | 'bottom';
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    rotation?: number;
  }

  export interface BarcodeProps {
    value: string;
    options?: BarcodeOptions;
    rotation?: number;
  }

  export const Barcode: ComponentType<BarcodeProps>;
}
