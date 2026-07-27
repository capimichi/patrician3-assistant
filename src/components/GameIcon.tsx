import React from 'react';

interface GameIconProps {
  type: 'barrel' | 'load' | 'hourglass';
  className?: string;
  alt?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({
  type,
  className = 'h-4 w-4 object-contain inline-block align-middle mr-1.5',
  alt
}) => {
  return (
    <img
      src={`/images/${type}.png`}
      className={className}
      alt={alt || type}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
