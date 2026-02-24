'use client';
import { useEffect, useRef } from 'react';

export default function NativeBannerAd() {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    // Prevent multiple injections
    if (bannerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = 'https://pl28784046.effectivegatecpm.com/984d3f8515ec11bd4cb55312a7bcf113/invoke.js';
    
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center mt-10 mb-2">
      <div 
        id="container-984d3f8515ec11bd4cb55312a7bcf113" 
        ref={bannerRef}
        className="min-h-[100px] w-full max-w-3xl flex justify-center"
      ></div>
    </div>
  );
}
