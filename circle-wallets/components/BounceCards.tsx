import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BounceCardsProps {
  className?: string;
  images?: string[];
  items?: React.ReactNode[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  images = [],
  items = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'power3.out',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ],
  enableHover = false
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayItems = items.length > 0 ? items : images;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
          duration: 0.8
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  const pushSiblings = (hoveredIdx: number) => {
    const q = gsap.utils.selector(containerRef);
    if (!enableHover || !containerRef.current) return;

    displayItems.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotation = getNoRotationTransform(baseTransform);
        gsap.to(selector, {
          transform: noRotation,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        const offsetX = i < hoveredIdx ? -140 : 140;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.02;

        gsap.to(selector, {
          transform: pushedTransform,
          duration: 0.5,
          ease: 'power3.out',
          delay,
          overwrite: 'auto'
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    displayItems.forEach((_, i) => {
      const selector = q(`.card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || 'none';
      gsap.to(selector, {
        transform: baseTransform,
        duration: 0.5,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div
      className={`relative flex items-end justify-center ${className}`}
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      {displayItems.map((item, idx) => (
        <div
          key={idx}
          className={`card card-${idx} absolute w-full max-w-[280px] aspect-[4/3] border border-white/5 bg-[#0a0a0a] backdrop-blur-md rounded-[20px] overflow-hidden flex flex-col p-6 text-white`}
          style={{
            transform: transformStyles[idx] || 'none'
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
        >
          {typeof item === 'string' && !items.length ? (
            <img className="w-full h-full object-cover opacity-80" src={item} alt={`card-${idx}`} />
          ) : (
            item
          )}
        </div>
      ))}
    </div>
  );
}
