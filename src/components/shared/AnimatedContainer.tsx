import React, { ReactNode, useEffect, useState } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0,
  className = '',
  staggerChildren = false,
  staggerDelay = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (staggerChildren) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div className={className}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={`transform transition-all duration-700 ease-out ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
            style={{
              transitionDelay: `${delay + (index * staggerDelay)}ms`
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`transform transition-all duration-700 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer; 