import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

interface BookingStepRevealProps {
  stepKey: string | number;
  children: ReactNode;
  className?: string;
}

export function BookingStepReveal({ stepKey, children, className = '' }: BookingStepRevealProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), 32);
    return () => window.clearTimeout(timer);
  }, [stepKey]);

  return (
    <div
      className={`booking-modal__reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}

interface BookingRevealItemProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function BookingRevealItem({ index, children, className = '' }: BookingRevealItemProps) {
  return (
    <div
      className={`booking-modal__reveal-item${className ? ` ${className}` : ''}`}
      style={{ '--booking-reveal-delay': `${index * 55}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
