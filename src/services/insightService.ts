import api from './api';
import type { BlogPost } from '../types';
import { blogPosts as defaultBlogPosts } from '../data/blog';

export const insightService = {
  /**
   * Get all published insights and resources
   */
  async getInsights(): Promise<BlogPost[]> {
    try {
      const response = await api.get('/insights');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      // Graceful fallback to verified structured repository data
      console.warn('Using client fallback for insights:', err);
    }
    return defaultBlogPosts;
  },

  /**
   * Get single insight by slug or ID
   */
  async getInsightBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const response = await api.get(`/insights/${slug}`);
      if (response.data && response.data.slug) {
        return response.data;
      }
    } catch {
      // Graceful fallback to verified structured repository data
    }
    return defaultBlogPosts.find((p) => p.slug === slug || p.id === slug);
  },

  /**
   * Get related insights excluding the current slug
   */
  async getRelatedInsights(currentSlug: string, limit = 2): Promise<BlogPost[]> {
    const all = await this.getInsights();
    return all.filter((p) => p.slug !== currentSlug).slice(0, limit);
  }
};

export const blogService = insightService;
