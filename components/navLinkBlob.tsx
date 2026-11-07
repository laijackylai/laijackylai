import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

type Props = {
  href: string;
  label: string;
  className?: string;
};

const NavLinkBlob: React.FC<Props> = ({ href, label, className = '' }) => {
  const router = useRouter();
  const [blobPos, setBlobPos] = useState({ x: 0, y: 0 });
  const [fillSize, setFillSize] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const isActive = router.pathname === href;

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setBlobPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const isKeyboardActivation = event.detail === 0;
    const x = isKeyboardActivation ? rect.width / 2 : event.clientX - rect.left;
    const y = isKeyboardActivation ? rect.height / 2 : event.clientY - rect.top;

    setBlobPos({ x, y });
    setFillSize(Math.ceil(Math.hypot(rect.width, rect.height) * 2));
    setIsClicked(true);
    setIsHovered(true);

    window.setTimeout(() => {
      if (router.pathname === href) {
        setIsClicked(false);
        setIsHovered(false);
        return;
      }

      void router.push(href);
    }, 200);
  }, [href, router]);

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={`relative block w-fit overflow-hidden px-6 py-3 font-mono text-body-sm uppercase tracking-nav transition-colors duration-200 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <span
        aria-hidden="true"
          className="pointer-events-none absolute motion-safe:transition-all motion-safe:duration-[700ms] motion-safe:ease-linear"
        style={{
          left: blobPos.x,
          top: blobPos.y,
          width: isClicked ? fillSize : 50,
          height: isClicked ? fillSize : 50,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          backgroundColor: '#000000',
          opacity: isClicked ? 1 : isHovered ? 0.28 : 0,
          filter: isClicked ? 'none' : 'blur(18px)',
        }}
      />
      <span className={`relative z-10 transition-colors duration-200 ${isClicked ? 'text-white' : 'text-black'}`}>
        {label}
      </span>
    </Link>
  );
};

export default NavLinkBlob;
