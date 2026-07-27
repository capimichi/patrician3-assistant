import React from 'react';

interface GoldAmountProps {
  amount: number | string;
  className?: string;
  iconSize?: string;
}

export const GoldAmount: React.FC<GoldAmountProps> = ({
  amount,
  className = "font-mono font-bold text-neutral-dark",
  iconSize = "h-4 w-4"
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{amount}</span>
      <img
        src="/images/gold.png"
        alt="oro"
        className={`${iconSize} object-contain inline-block align-middle`}
      />
    </span>
  );
};
