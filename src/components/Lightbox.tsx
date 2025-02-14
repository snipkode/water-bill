import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

interface LightboxProps {
  imageUrl: string;
  altText: string;
}

const Lightbox: React.FC<LightboxProps> = ({ imageUrl, altText }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = () => setIsOpen(true);
  const closeLightbox = () => setIsOpen(false);

  return (
    <>
      <img
        src={imageUrl}
        alt={altText}
        className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity"
        onClick={openLightbox}
      />
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={closeLightbox}
            >
              <XIcon className="h-8 w-8" />
            </button>
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full rounded-md"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Lightbox;
