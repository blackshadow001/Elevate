"use client";

import React, { useState } from "react";
import { BookOpen } from "lucide-react";

interface CourseThumbnailProps {
  category: string;
  title: string;
  imageUrl?: string;
  className?: string;
  priority?: boolean;
}

export function CourseThumbnail({
  category,
  title,
  imageUrl,
  className = "",
}: CourseThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-slate-900 select-none ${className}`}>
      {/* 1. Real Course Thumbnail Photo */}
      {imageUrl && !imgError && (
        <img
          src={imageUrl}
          alt={title}
          ref={(el) => {
            if (el && el.complete && el.naturalWidth > 0 && !imgLoaded) {
              setImgLoaded(true);
            }
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-100 hover:scale-100 motion-reduce:transform-none z-[1]"
        />
      )}

      {/* 2. Neutral Skeleton Shimmer (Behind image while decoding) */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}

      {/* 3. Resilient Fallback only if image fails or missing */}
      {(!imageUrl || imgError) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#172033] via-[#26344D] to-[#172033] flex items-center justify-center p-6 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );
}
