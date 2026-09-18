import React, { useState, useEffect, useRef } from 'react';
import { Play, VideoOff, Sparkles, ShieldCheck } from 'lucide-react';
import Hls from 'hls.js';

interface CoursePreviewPlayerProps {
  videoUrl?: string | null;
  title: string;
  thumbnail?: string;
  className?: string;
}

export const CoursePreviewPlayer: React.FC<CoursePreviewPlayerProps> = ({
  videoUrl,
  title,
  thumbnail,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Reset playback state whenever the videoUrl changes
  useEffect(() => {
    setIsPlaying(false);
  }, [videoUrl]);

  // Helper: Extract YouTube ID
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const trimmed = url.trim();

    // Raw 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return `https://www.youtube-nocookie.com/embed/${trimmed}?autoplay=1&rel=0&modestbranding=1`;
    }

    // Try parsing with URL object first
    try {
      if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
        const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        if (urlObj.hostname.includes('youtu.be')) {
          const id = urlObj.pathname.slice(1).split('/')[0];
          if (id && id.length === 11) {
            return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
          }
        }
        const vParam = urlObj.searchParams.get('v');
        if (vParam && vParam.length === 11) {
          return `https://www.youtube-nocookie.com/embed/${vParam}?autoplay=1&rel=0&modestbranding=1`;
        }
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const embedIndex = pathParts.findIndex(p => ['embed', 'v', 'shorts', 'live'].includes(p));
        if (embedIndex !== -1 && pathParts[embedIndex + 1] && pathParts[embedIndex + 1].length === 11) {
          return `https://www.youtube-nocookie.com/embed/${pathParts[embedIndex + 1]}?autoplay=1&rel=0&modestbranding=1`;
        }
      }
    } catch {
      // Fallback to regex
    }

    // Comprehensive Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?(?:.*&)?v=))([a-zA-Z0-9_-]{11})/i);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }

    return null;
  };

  // Helper: Extract Vimeo Embed URL
  const getVimeoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^\d{6,11}$/.test(trimmed)) {
      return `https://player.vimeo.com/video/${trimmed}?autoplay=1`;
    }
    const match = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
    return null;
  };

  // Helper: Extract Bunny Stream iframe embed
  const getBunnyEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('iframe.mediadelivery.net')) {
      return url.includes('?') ? `${url}&autoplay=true` : `${url}?autoplay=true`;
    }
    return null;
  };

  const isHls = Boolean(videoUrl && videoUrl.includes('.m3u8'));
  const youtubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
  const vimeoEmbedUrl = videoUrl ? getVimeoEmbedUrl(videoUrl) : null;
  const bunnyEmbedUrl = videoUrl ? getBunnyEmbedUrl(videoUrl) : null;
  const isEmbed = Boolean(youtubeEmbedUrl || vimeoEmbedUrl || bunnyEmbedUrl);

  // Initialize HLS for .m3u8 streams
  useEffect(() => {
    if (!videoUrl || isEmbed || !isHls || !videoRef.current || !isPlaying) return;

    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.play().catch(() => {});
    }
  }, [videoUrl, isEmbed, isHls, isPlaying]);

  // Empty State: When no preview video exists
  if (!videoUrl || !videoUrl.trim()) {
    return (
      <div className={`w-full bg-warm-white border border-light-taupe rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}>
        <div className="w-16 h-16 rounded-full bg-warm-ivory border border-light-taupe flex items-center justify-center text-warm-gray/70 shadow-xs">
          <VideoOff className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h4 className="font-display font-bold text-base text-deep-navy">
            Course preview video is not available yet.
          </h4>
          <p className="text-xs text-warm-gray leading-relaxed">
            Check back soon for the official course trailer and curriculum walkthrough. In the meantime, you can explore the full syllabus in the Curriculum tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-2xl bg-black border border-light-taupe shadow-lg relative group aspect-video ${className}`}>
      {/* 1. If not yet played, show sleek thumbnail overlay with centered Play Button */}
      {!isPlaying ? (
        <div 
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-cover bg-center transition-all duration-300 group-hover:scale-[1.01]"
          style={{
            backgroundImage: thumbnail ? `linear-gradient(rgba(10, 18, 30, 0.4), rgba(10, 18, 30, 0.7)), url(${thumbnail})` : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        >
          {/* Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
            <span>Course Preview</span>
          </div>

          {/* Large Play Button */}
          <button 
            type="button"
            aria-label={`Play preview video for ${title}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-burnt-orange hover:bg-burnt-orange-500 text-white flex items-center justify-center shadow-2xl transition-all duration-200 transform group-hover:scale-110 active:scale-95"
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-white" />
          </button>

          {/* Video Title Subtitle overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-left">
            <p className="text-white font-display font-bold text-sm sm:text-base drop-shadow-md line-clamp-1">
              {title}
            </p>
            <span className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-green" />
              <span>Public Preview &bull; Click to Watch</span>
            </span>
          </div>
        </div>
      ) : (
        /* 2. Playing View */
        <div className="w-full h-full bg-black flex items-center justify-center">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title={`${title} Preview`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : vimeoEmbedUrl ? (
            <iframe
              src={vimeoEmbedUrl}
              title={`${title} Preview`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : bunnyEmbedUrl ? (
            <iframe
              src={bunnyEmbedUrl}
              title={`${title} Preview`}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={!isHls ? videoUrl : undefined}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              poster={thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  );
};
