import './wifi-loader.web.css';

interface WifiLoaderProps {
  size: number;
  showLabel?: boolean;
  label?: string;
}

export function WifiLoader({ size, showLabel = false, label = 'Searching' }: WifiLoaderProps) {
  return (
    <div className="wifi-loader-shell">
      <div className="wifi-loader" style={{ ['--loader-size' as string]: `${size}px` }}>
        <svg className="circle-outer" viewBox="0 0 86 86" aria-hidden>
          <circle className="back" cx="43" cy="43" r="40" />
          <circle className="front" cx="43" cy="43" r="40" />
        </svg>
        <svg className="circle-middle" viewBox="0 0 60 60" aria-hidden>
          <circle className="back" cx="30" cy="30" r="27" />
          <circle className="front" cx="30" cy="30" r="27" />
        </svg>
        <svg className="circle-inner" viewBox="0 0 34 34" aria-hidden>
          <circle className="back" cx="17" cy="17" r="14" />
          <circle className="front" cx="17" cy="17" r="14" />
        </svg>
        {showLabel ? <div className="loader-text" data-text={label} /> : null}
      </div>
    </div>
  );
}
