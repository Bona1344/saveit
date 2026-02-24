'use client';
import { useEffect, useRef } from 'react';

export default function NativeBannerAd() {
  const containerRef = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // Adsterra native banner: the script must be placed AFTER the container div
    // and NOT inside it. The invoke.js script searches for the container by ID
    // and injects the ad content into it.
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl28784046.effectivegatecpm.com/984d3f8515ec11bd4cb55312a7bcf113/invoke.js';

    // Append script AFTER the container div (as a sibling, not a child)
    if (containerRef.current && containerRef.current.parentNode) {
      containerRef.current.parentNode.insertBefore(
        script,
        containerRef.current.nextSibling
      );
    } else {
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center mt-10 mb-2">
      <div
        id="container-984d3f8515ec11bd4cb55312a7bcf113"
        ref={containerRef}
        className="w-full max-w-3xl"
      ></div>
    </div>
  );
}
