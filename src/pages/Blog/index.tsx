import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Tag,
  Share2,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';
import type { BlogPost } from '../../types';
import { insightService } from '../../services/insightService';
import { SEO } from '../../components/common/SEO';

// 1. Resources Index Page component (/resources, /blog, /insights)
export const Resources: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    insightService.getInsights()
      .then((data) => {
        if (isMounted) {
          setPosts(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching insights:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const featuredPost = filteredPosts[0];
  const listPosts = filteredPosts.slice(1);

  return (
    <div className="bg-warm-ivory min-h-screen py-10 sm:py-14">
      <SEO 
        title="Resources & Insights | Practical Engineering Roadmaps" 
        description="Access Oxyfied's directory of cybersecurity roadmaps, Python engineering cheat sheets, and practical career guides."
        canonical="/resources"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Page Header */}
        <div className="text-left space-y-2.5 border-b border-light-taupe/80 pb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-burnt-orange bg-[#FEF5EE] border border-burnt-orange/25 uppercase tracking-widest shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-burnt-orange" />
              Articles & Insights
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-deep-navy tracking-tight">
            Latest Insights & <span className="text-burnt-orange">Resources</span>
          </h1>
          <p className="text-warm-gray text-xs sm:text-sm max-w-2xl leading-relaxed">
            Curated guides, hands-on tutorials, cybersecurity checklists, and real-world system architectures from industry mentors.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-nowrap text-left">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-burnt-orange text-white border border-burnt-orange shadow-xs'
                    : 'bg-warm-white text-deep-navy border border-light-taupe hover:border-burnt-orange/50 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-80 bg-white/70 border border-light-taupe rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-white/70 border border-light-taupe rounded-2xl" />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-warm-white border border-light-taupe rounded-3xl space-y-3">
            <Layers className="w-10 h-10 text-burnt-orange mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-deep-navy font-display">No articles found</h3>
            <p className="text-xs text-warm-gray">Check back soon for new guides and technical insights.</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Featured Post Card */}
            {featuredPost && (
              <Link
                to={`/resources/${featuredPost.slug}`}
                className="group block bg-warm-white border border-light-taupe rounded-3xl overflow-hidden shadow-2xs hover:border-burnt-orange/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-7 bg-soft-beige aspect-[16/10] lg:aspect-auto overflow-hidden relative">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-burnt-orange text-white text-[11px] font-bold rounded-full shadow-md uppercase tracking-wider">
                        <Tag className="w-3 h-3" />
                        Featured Article
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6">
                    <div className="space-y-3">
                      <span className="text-[11px] font-extrabold text-burnt-orange uppercase tracking-wider block">
                        {featuredPost.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy group-hover:text-burnt-orange transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-warm-gray text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-light-taupe/80">
                      <div className="flex items-center justify-between text-xs font-semibold text-warm-gray">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-burnt-orange" />
                          {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sage-green" />
                          {featuredPost.readTime}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-xs font-bold text-burnt-orange group-hover:text-deep-orange transition-colors">
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Articles List Grid */}
            {listPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {listPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/resources/${post.slug}`}
                    className="group bg-warm-white border border-light-taupe rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xs hover:border-burnt-orange/60 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-soft-beige relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-burnt-orange bg-[#FEF5EE]/95 border border-burnt-orange/20 shadow-2xs">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-display font-extrabold text-base sm:text-lg text-deep-navy group-hover:text-burnt-orange transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-warm-gray text-xs leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-light-taupe/80 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-warm-gray font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-burnt-orange" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sage-green" />
                            {post.readTime}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-burnt-orange group-hover:text-deep-orange">
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// 2. Resource Details Dynamic View component (/resources/:slug, /blog/:slug, /insights/:slug)
export const ResourceDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    setIsLoading(true);
    insightService.getInsightBySlug(slug)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setPost(data);
            insightService.getRelatedInsights(slug, 2).then((rel) => {
              if (isMounted) setRelatedPosts(rel);
            });
          } else {
            setPost(null);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load article details:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-warm-ivory min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-pulse text-left">
          <div className="h-6 w-32 bg-white/70 rounded-full" />
          <div className="h-10 w-3/4 bg-white/70 rounded-2xl" />
          <div className="h-80 bg-white/70 rounded-3xl" />
          <div className="h-40 bg-white/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-warm-ivory">
        <div className="w-16 h-16 rounded-full bg-burnt-orange/10 flex items-center justify-center text-burnt-orange mb-2">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-deep-navy font-display">Insight Article Not Found</h2>
        <p className="text-xs sm:text-sm text-warm-gray max-w-md">
          The requested article may have been moved or updated. Browse all available guides and resources.
        </p>
        <Link to="/resources" className="btn-primary px-6 py-2.5 text-xs font-bold rounded-full shadow-md">
          Back to All Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory min-h-screen py-10 sm:py-14">
      <SEO 
        title={`${post.title} | Oxyfied Insights`}
        description={post.excerpt} 
        canonical={`/resources/${post.slug}`} 
        ogImage={post.image}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        
        {/* Navigation & breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-navy/80 hover:text-burnt-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Resources</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-light-taupe text-deep-navy hover:text-burnt-orange hover:border-burnt-orange/40 transition-all shadow-2xs cursor-pointer"
            title="Share article link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-sage-green" />
                <span className="text-sage-green">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-warm-gray" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Article Meta Header */}
        <div className="space-y-4">
          <div>
            <span className="px-3 py-1 bg-[#FEF5EE] border border-burnt-orange/25 text-burnt-orange text-xs font-extrabold rounded-full uppercase tracking-wider inline-block shadow-2xs">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-deep-navy leading-tight tracking-tight">
            {post.title}
          </h1>

          <p className="text-warm-gray text-sm sm:text-base leading-relaxed font-normal">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-warm-gray font-medium border-y border-light-taupe/80 py-3.5">
            <span className="flex items-center gap-1.5 font-bold text-deep-navy">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-5 h-5 rounded-full object-cover border border-light-taupe"
              />
              {post.author.name}
            </span>
            <span className="text-light-taupe">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-burnt-orange" />
              {post.date}
            </span>
            <span className="text-light-taupe">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sage-green" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Hero image */}
        <div className="aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-soft-beige shadow-md border border-light-taupe">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="bg-warm-white border border-light-taupe p-6 sm:p-10 rounded-3xl shadow-sm space-y-6">
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={index} className="text-xl sm:text-2xl font-display font-extrabold text-deep-navy pt-4 mb-2">
                  {trimmed.replace('# ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={index} className="text-lg sm:text-xl font-display font-bold text-deep-navy pt-3 mb-2 text-burnt-orange">
                  {trimmed.replace('## ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('* ')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-deep-navy/85 my-3">
                  {trimmed.split('\n').map((li, i) => {
                    const cleanLi = li.replace(/^\*\s+/, '');
                    return (
                      <li key={i} className="leading-relaxed">
                        {cleanLi}
                      </li>
                    );
                  })}
                </ul>
              );
            }
            if (trimmed.startsWith('`')) {
              return (
                <pre key={index} className="p-4 bg-deep-navy text-warm-white rounded-2xl font-mono text-xs overflow-x-auto my-4 border border-light-taupe">
                  {trimmed.replace(/`/g, '')}
                </pre>
              );
            }
            return (
              <p key={index} className="text-xs sm:text-sm text-deep-navy/85 leading-relaxed font-normal">
                {trimmed}
              </p>
            );
          })}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-light-taupe/80 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-warm-gray mr-1">Tags:</span>
              {post.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-warm-ivory text-[11px] font-semibold text-deep-navy border border-light-taupe/70">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Author info block */}
          <div className="border-t border-light-taupe/80 pt-6 flex items-center gap-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-13 h-13 rounded-full object-cover border-2 border-burnt-orange/30 shadow-2xs"
            />
            <div>
              <span className="text-sm font-extrabold text-deep-navy block">{post.author.name}</span>
              <span className="text-xs text-warm-gray block mt-0.5">{post.author.role}</span>
            </div>
          </div>
        </div>

        {/* CTA Banner: Learn In-Demand Skills */}
        <div className="bg-deep-navy text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-1.5 text-left relative z-10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-burnt-orange uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Upskill with Oxyfied
            </span>
            <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
              Ready to Practice Real Technology Skills?
            </h3>
            <p className="text-xs text-warm-gray-200 max-w-lg leading-relaxed">
              Explore live sandbox labs and mentored cohorts in Cybersecurity, Data Science, and AI.
            </p>
          </div>

          <Link
            to="/courses"
            className="btn-primary px-6 py-3 text-xs font-bold rounded-full whitespace-nowrap shadow-lg flex-shrink-0"
          >
            <span>Explore Programs</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Related Insights */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-light-taupe/80">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-xl text-deep-navy">
                Related Articles & Resources
              </h3>
              <Link to="/resources" className="text-xs font-bold text-burnt-orange hover:text-deep-orange flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  to={`/resources/${r.slug}`}
                  className="group bg-warm-white border border-light-taupe rounded-3xl p-4 flex gap-4 items-center shadow-2xs hover:border-burnt-orange hover:shadow-md transition-all text-left"
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-burnt-orange uppercase block">
                      {r.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-deep-navy group-hover:text-burnt-orange transition-colors truncate">
                      {r.title}
                    </h4>
                    <p className="text-[11px] text-warm-gray truncate">
                      {r.readTime} • {r.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
};
