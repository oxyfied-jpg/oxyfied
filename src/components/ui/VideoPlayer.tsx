import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Loader2, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Gauge, 
  Sliders
} from 'lucide-react';
import Hls from 'hls.js';
import { videoService } from '../../services/videoService';
import type { PlaybackAccess } from '../../services/videoService';

interface VideoPlayerProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  onEnded?: () => void;
}

export interface FormattedQuality {
  id: string; // Quality identifier e.g. 'auto', 'level_0', 'hd1080'
  label: string; // Display label e.g. '1080p', '720p', 'Auto'
  order: number; // For sorting lowest to highest
  badge?: string; // Optional badge e.g. 'HD', '4K'
  levelIndex?: number; // HLS level index
}

// Multi-bitrate sample adaptive stream with working 1080p, 720p, 480p, 360p, 240p
const DEFAULT_HLS_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Format seconds into MM:SS or HH:MM:SS
const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  onEnded
}) => {
  // Session / authorization state
  const [loading, setLoading] = useState(true);
  const [playbackAccess, setPlaybackAccess] = useState<PlaybackAccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Core playback state
  const [playing, setPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Quality & Speed Settings state
  const [availableQualities, setAvailableQualities] = useState<FormattedQuality[]>([
    { id: 'auto', label: 'Auto', order: 0, levelIndex: -1 }
  ]);
  const [requestedQuality, setRequestedQuality] = useState<string>('auto');
  const [actualQuality, setActualQuality] = useState<string>('Auto');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<'root' | 'quality' | 'speed'>('root');

  // Seek bar hover preview
  const [hoverSeekTime, setHoverSeekTime] = useState<string | null>(null);
  const [hoverSeekPos, setHoverSeekPos] = useState<number>(0);

  // Refs
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const hideControlsTimerRef = useRef<any>(null);
  const prevVolumeRef = useRef<number>(80);

  // Fetch token-based authorization stream info when lesson or course changes
  useEffect(() => {
    let isMounted = true;
    const fetchStream = async () => {
      setLoading(true);
      setError(null);
      setPlaying(false);
      setCurrentTimeSec(0);
      setDurationSec(0);
      setBufferedPercent(0);
      setRequestedQuality('auto');
      setActualQuality('Auto');
      setAvailableQualities([{ id: 'auto', label: 'Auto', order: 0, levelIndex: -1 }]);
      setSettingsOpen(false);
      setSettingsView('root');

      try {
        const access = await videoService.getVideoPlaybackInfo(courseId, lessonId);
        if (!isMounted) return;
        if (access.success) {
          setPlaybackAccess(access);
        } else {
          setError('Failed to authorize playback session.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Network error securing stream link.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStream();
    return () => {
      isMounted = false;
    };
  }, [courseId, lessonId]);

  // Initialize YouTube IFrame or HLS Stream engine
  useEffect(() => {
    if (!playbackAccess) return;

    // 1. YouTube Video Mode
    if (playbackAccess.videoType === 'youtube' && playbackAccess.youtubeVideoId) {
      let ytInstance: any = null;
      let timerId: any = null;

      const initYt = () => {
        const el = document.getElementById(`yt-player-${lessonId}`);
        if (!el || !(window as any).YT?.Player) return;

        try {
          ytInstance = new (window as any).YT.Player(`yt-player-${lessonId}`, {
            width: '100%',
            height: '100%',
            videoId: playbackAccess.youtubeVideoId,
            playerVars: {
              autoplay: 1,
              controls: 1, // Native YouTube controls for working quality switching
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1,
              origin: window.location.origin,
              playsinline: 1
            },
            events: {
              onStateChange: (event: any) => {
                if (event.data === 0 && onEnded) {
                  onEnded();
                }
              }
            }
          });
        } catch (e) {
          console.warn('YouTube player initialization skipped:', e);
        }
      };

      if (!(window as any).YT || !(window as any).YT.Player) {
        const SCRIPT_ID = 'youtube-iframe-api-singleton';
        if (!document.getElementById(SCRIPT_ID)) {
          const tag = document.createElement('script');
          tag.id = SCRIPT_ID;
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScript = document.getElementsByTagName('script')[0];
          firstScript?.parentNode?.insertBefore(tag, firstScript);
        }
        const prevReady = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (typeof prevReady === 'function') {
            try { prevReady(); } catch (err) {}
          }
          initYt();
        };
      } else {
        timerId = setTimeout(initYt, 50);
      }

      return () => {
        if (timerId) clearTimeout(timerId);
        if (ytInstance && typeof ytInstance.destroy === 'function') {
          try { ytInstance.destroy(); } catch (e) {}
        }
      };
    }

    // 2. Custom HLS / Direct Video Mode
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const videoEl = videoRef.current;
    if (!videoEl) return;

    const streamUrl = playbackAccess.hlsUrl || playbackAccess.videoUrl || DEFAULT_HLS_STREAM;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const qualities: FormattedQuality[] = [
          { id: 'auto', label: 'Auto', order: 0, levelIndex: -1 }
        ];

        data.levels.forEach((lvl, idx) => {
          const height = lvl.height || (idx === 0 ? 360 : idx === 1 ? 480 : idx === 2 ? 720 : 1080);
          const label = `${height}p`;
          const badge = height >= 2160 ? '4K' : height >= 1080 ? 'HD' : height >= 720 ? 'HD' : undefined;
          
          qualities.push({
            id: `level_${idx}`,
            label,
            order: height,
            badge,
            levelIndex: idx
          });
        });

        const autoOpt = qualities[0];
        const rest = qualities.slice(1).sort((a, b) => a.order - b.order);
        setAvailableQualities([autoOpt, ...rest]);

        videoEl.play().then(() => setPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const activeLevel = hls.levels[data.level];
        if (activeLevel) {
          const h = activeLevel.height;
          setActualQuality(h ? `${h}p` : `Level ${data.level + 1}`);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = streamUrl;
    } else {
      videoEl.src = playbackAccess.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playbackAccess, lessonId, onEnded]);

  // Handle Play/Pause Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setPlaying(true);
      }).catch(() => {});
    }
  };

  // Seek bar handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = ratio * durationSec;

    videoRef.current.currentTime = targetSeconds;
    setCurrentTimeSec(targetSeconds);
  };

  // Seek bar hover preview calculation
  const handleSeekMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const hoverSeconds = ratio * durationSec;
    setHoverSeekTime(formatTime(hoverSeconds));
    setHoverSeekPos(ratio * 100);
  };

  const handleSeekMouseLeave = () => {
    setHoverSeekTime(null);
  };

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    const shouldMute = val === 0;
    setMuted(shouldMute);

    if (videoRef.current) {
      videoRef.current.volume = val / 100;
      videoRef.current.muted = shouldMute;
    }
  };

  // Mute toggle
  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);

    if (nextMuted) {
      prevVolumeRef.current = volume > 0 ? volume : 80;
      setVolume(0);
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    } else {
      const restored = prevVolumeRef.current || 80;
      setVolume(restored);
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = restored / 100;
      }
    }
  };

  /**
   * Real-time Quality Switching Handler
   * Commands Hls.js to immediately switch to the target bitrate/resolution level.
   */
  const handleSelectQuality = (quality: FormattedQuality) => {
    setRequestedQuality(quality.id);
    setSettingsOpen(false);
    setSettingsView('root');

    if (hlsRef.current) {
      if (quality.id === 'auto') {
        // -1 enables automatic adaptive bitrate based on bandwidth
        hlsRef.current.currentLevel = -1;
        setActualQuality('Auto');
      } else if (typeof quality.levelIndex === 'number') {
        // Instantly locks the video stream into the chosen resolution
        hlsRef.current.currentLevel = quality.levelIndex;
        hlsRef.current.nextLevel = quality.levelIndex;
        setActualQuality(quality.label);
      }
    }
  };

  // Playback Speed Selection
  const handleSelectSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setSettingsOpen(false);
    setSettingsView('root');

    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Track native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Controls auto-hide timer
  const triggerControlsActivity = () => {
    setControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (playing && !settingsOpen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2800);
    }
  };

  // Keep controls visible when paused or settings menu is open
  useEffect(() => {
    if (!playing || settingsOpen) {
      setControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      triggerControlsActivity();
    }
  }, [playing, settingsOpen]);

  // Click outside & Escape key listeners for Settings Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        settingsRef.current && 
        !settingsRef.current.contains(event.target as Node) &&
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
        setSettingsView('root');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (settingsOpen) {
          setSettingsOpen(false);
          setSettingsView('root');
        }
      } else if (event.key === ' ' || event.key === 'k') {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          event.preventDefault();
          togglePlay();
        }
      } else if (event.key === 'f') {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          event.preventDefault();
          toggleFullscreen();
        }
      } else if (event.key === 'm') {
        const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          event.preventDefault();
          toggleMute();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen, playing, muted, volume]);

  const progressPercent = durationSec > 0 ? (currentTimeSec / durationSec) * 100 : 0;

  // Settings display labels
  const currentQualityDisplay = requestedQuality === 'auto'
    ? `Auto (${actualQuality})`
    : (availableQualities.find(q => q.id === requestedQuality)?.label || requestedQuality);

  const currentSpeedDisplay = playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`;

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={triggerControlsActivity}
      onTouchStart={triggerControlsActivity}
      onMouseLeave={() => {
        if (playing && !settingsOpen) {
          setControlsVisible(false);
        }
      }}
      className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border border-stone-800 select-none group focus:outline-none"
      tabIndex={0}
    >
      {/* Video Surface */}
      {playbackAccess && !error && (
        playbackAccess.videoType === 'youtube' && playbackAccess.youtubeVideoId ? (
          <div className="w-full h-full bg-black">
            <div id={`yt-player-${lessonId}`} className="w-full h-full border-0" />
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTimeSec(videoRef.current.currentTime);
                setDurationSec(videoRef.current.duration || 0);

                if (videoRef.current.buffered.length > 0) {
                  const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                  const dur = videoRef.current.duration;
                  if (dur > 0) {
                    setBufferedPercent((end / dur) * 100);
                  }
                }
              }
            }}
            onEnded={onEnded}
            playsInline
          />
        )
      )}

      {/* Central Play Button when paused (for Custom Video Mode) */}
      {!loading && !error && !playing && playbackAccess?.videoType !== 'youtube' && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer transition-colors duration-200 z-15 hover:bg-black/45"
        >
          <div className="p-4 sm:p-5 rounded-full bg-amber-500 text-stone-950 shadow-2xl transform scale-100 hover:scale-110 active:scale-95 transition-all duration-200">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 text-white z-30">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
          <p className="text-stone-400 text-xs font-medium tracking-wide">Securing playback stream...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 text-white z-30 p-6 text-center">
          <RotateCcw className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-stone-200 font-semibold text-sm mb-1">Authorization Failed</p>
          <p className="text-stone-400 text-xs max-w-sm">{error}</p>
        </div>
      )}

      {/* Custom Settings Popover Menu (for Custom/HLS Video Mode) */}
      {settingsOpen && playbackAccess?.videoType !== 'youtube' && (
        <div
          ref={settingsRef}
          className="absolute bottom-16 right-3 sm:right-5 z-40 bg-stone-900/95 backdrop-blur-md border border-stone-750 rounded-xl shadow-2xl p-1.5 w-60 sm:w-68 text-stone-200 text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Settings Root View */}
          {settingsView === 'root' && (
            <div className="space-y-0.5">
              <div className="px-3 py-2 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                Playback Settings
              </div>

              {/* Quality Menu Item */}
              <button
                type="button"
                onClick={() => setSettingsView('quality')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-stone-800/80 transition-colors text-left group/item"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-stone-200">Quality</span>
                </div>
                <div className="flex items-center gap-1 text-stone-400 group-hover/item:text-stone-200">
                  <span className="text-[11px] font-semibold truncate max-w-[100px]">
                    {currentQualityDisplay}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Speed Menu Item */}
              <button
                type="button"
                onClick={() => setSettingsView('speed')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-stone-800/80 transition-colors text-left group/item"
              >
                <div className="flex items-center gap-2.5">
                  <Gauge className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-stone-200">Playback Speed</span>
                </div>
                <div className="flex items-center gap-1 text-stone-400 group-hover/item:text-stone-200">
                  <span className="text-[11px] font-semibold">{currentSpeedDisplay}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          )}

          {/* Quality Submenu View (Real-time Hls.js Bitrate Switcher) */}
          {settingsView === 'quality' && (
            <div className="space-y-0.5">
              {/* Back Header */}
              <button
                type="button"
                onClick={() => setSettingsView('root')}
                className="w-full flex items-center gap-2 px-3 py-2 border-b border-stone-800 hover:text-white transition-colors text-stone-400 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4 text-amber-500" />
                <span>Quality</span>
              </button>

              {/* Dynamic Qualities List */}
              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                {availableQualities.map((item) => {
                  const isSelected = requestedQuality === item.id;
                  const isCurrentlyStreaming = actualQuality.toLowerCase() === item.label.toLowerCase();

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectQuality(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        isSelected 
                          ? 'bg-amber-500/15 text-amber-400 font-bold' 
                          : 'hover:bg-stone-800/80 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 flex items-center justify-center flex-shrink-0">
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {item.id === 'auto' && actualQuality && (
                          <span className="text-[10px] text-stone-500 font-normal">
                            ({actualQuality})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCurrentlyStreaming && !isSelected && (
                          <span className="text-[9px] text-stone-400 font-medium">
                            Current
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 border border-amber-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Speed Submenu View */}
          {settingsView === 'speed' && (
            <div className="space-y-0.5">
              {/* Back Header */}
              <button
                type="button"
                onClick={() => setSettingsView('root')}
                className="w-full flex items-center gap-2 px-3 py-2 border-b border-stone-800 hover:text-white transition-colors text-stone-400 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4 text-amber-500" />
                <span>Playback Speed</span>
              </button>

              {/* Speed Options List */}
              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                {SPEED_OPTIONS.map((rate) => {
                  const isSelected = playbackSpeed === rate;
                  const label = rate === 1 ? 'Normal (1x)' : `${rate}x`;

                  return (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSelectSpeed(rate)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        isSelected 
                          ? 'bg-amber-500/15 text-amber-400 font-bold' 
                          : 'hover:bg-stone-800/80 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 flex items-center justify-center">
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                        <span>{label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Controls Bar Overlay (for Custom Video Mode) */}
      {!loading && !error && playbackAccess?.videoType !== 'youtube' && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-25 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-10 pb-3 px-3 sm:px-4 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek / Progress Bar with hover timestamp tooltip */}
          <div
            onClick={handleSeek}
            onMouseMove={handleSeekMouseMove}
            onMouseLeave={handleSeekMouseLeave}
            className="relative w-full h-1.5 hover:h-2.5 bg-stone-700/60 rounded-full mb-3 cursor-pointer transition-all duration-150 group/seek"
          >
            {/* Buffered Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-stone-500/50 rounded-full transition-all duration-300"
              style={{ width: `${bufferedPercent}%` }}
            />

            {/* Played Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-amber-500 rounded-full flex items-center justify-end"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-md border-2 border-amber-600 scale-0 group-hover/seek:scale-100 transition-transform" />
            </div>

            {/* Hover timestamp tooltip */}
            {hoverSeekTime && (
              <div
                className="absolute bottom-4 transform -translate-x-1/2 bg-stone-900/95 border border-stone-750 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow pointer-events-none"
                style={{ left: `${hoverSeekPos}%` }}
              >
                {hoverSeekTime}
              </div>
            )}
          </div>

          {/* Controls Bottom Row */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Left controls: Play/Pause, Volume, Time */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="p-1 text-stone-200 hover:text-amber-400 transition-colors focus:outline-none"
                title={playing ? 'Pause (Space / K)' : 'Play (Space / K)'}
              >
                {playing ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                )}
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 text-stone-200 hover:text-amber-400 transition-colors focus:outline-none"
                  title={muted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : volume < 50 ? (
                    <Volume1 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-18 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:h-1.5 transition-all focus:outline-none"
                  title="Volume (Arrow Up / Down)"
                />
              </div>

              {/* Current Time / Duration */}
              <span className="text-[11px] sm:text-xs font-mono text-stone-300 font-medium">
                {formatTime(currentTimeSec)} / {formatTime(durationSec)}
              </span>
            </div>

            {/* Right controls: Lesson Title, Settings (Quality & Speed), Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {lessonTitle && (
                <span className="hidden md:inline text-[11px] text-stone-400 font-medium truncate max-w-[200px]">
                  {lessonTitle}
                </span>
              )}

              {/* Settings Button */}
              <button
                ref={settingsBtnRef}
                type="button"
                onClick={() => {
                  setSettingsOpen((prev) => !prev);
                  setSettingsView('root');
                }}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                  settingsOpen 
                    ? 'text-amber-400 bg-stone-800' 
                    : 'text-stone-200 hover:text-amber-400 hover:bg-stone-800/60'
                }`}
                title="Settings (Quality & Speed)"
              >
                <Settings className={`w-4 h-4 sm:w-5 sm:h-5 ${settingsOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 text-stone-200 hover:text-amber-400 transition-colors focus:outline-none"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


