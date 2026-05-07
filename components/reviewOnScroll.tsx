import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode
}

const RevealOnScroll: React.FC<Props> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    const scrollObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        scrollObserver.unobserve(entry.target);
      }
    });

    if (element) {
      scrollObserver.observe(element);
    }

    return () => {
      if (element) {
        scrollObserver.unobserve(element);
      }
    };
  }, []);

  const classes = `transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`;

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
};

export default RevealOnScroll
