import React, { useState } from 'react';
import { ASSET_IMAGES } from '../utils/assets';
import { Image as ImageIcon } from 'lucide-react';

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = ASSET_IMAGES.completeCollection,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync if src prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div
        className={`bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-8 h-8 opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
      {...rest}
    />
  );
};
