import api from './api';

export interface PlaybackAccess {
  success: boolean;
  videoType: 'bunny' | 'youtube' | 'hls' | 'vimeo' | 'custom' | string;
  youtubeVideoId?: string;
  videoUrl?: string;
  token: string;
  bunnyVideoId?: string;
  bunnyLibraryId?: string;
  hlsUrl?: string;
  embedUrl?: string;
}

export const videoService = {
  getVideoPlaybackInfo: async (courseId: string, lessonId: string): Promise<PlaybackAccess> => {
    const response = await api.get(`/videos/authorize`, {
      params: { courseId, lessonId }
    });
    return response.data;
  }
};
