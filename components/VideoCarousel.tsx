'use client';

import { useState, useEffect, useRef } from 'react';

interface Video {
  _id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  videoFileUrl?: string;
  thumbnail?: string;
  category?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

const fallbackVideos: Video[] = [
  {
    _id: '1',
    title: 'Our Video Lives Through Wellness Video Stories',
    description: 'Explore inspiring stories of transformation and growth through our wellness videos, showcasing real journeys toward healthier, happier lives.',
    youtubeUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&h=600&fit=crop',
    category: 'Youtube',
  },
  {
    _id: '2',
    title: 'Understanding PCOS: A Gut Shell Approach',
    description: 'Learn how functional nutrition can help manage PCOS symptoms and restore hormonal balance naturally.',
    youtubeUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1505576399279-0d00abde0e9a?w=900&h=600&fit=crop',
    category: 'Youtube',
  },
  {
    _id: '3',
    title: 'Gut Health 101: Healing Your Digestive System',
    description: 'Discover the connection between gut health and overall wellness in this comprehensive guide.',
    youtubeUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=600&fit=crop',
    category: 'Podcast',
  },
];

export default function VideoCarousel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/videos')
      .then((r) => r.json())
      .then((d) => setVideos(d.videos?.length ? d.videos : fallbackVideos))
      .catch(() => setVideos(fallbackVideos));
  }, []);

  const displayVideos = videos.length > 0 ? videos : fallbackVideos;

  const scrollTo = (index: number) => {
    const next = Math.max(0, Math.min(index, displayVideos.length - 1));
    setCurrent(next);
    setPlaying(null);
    if (scrollRef.current) {
      const card = scrollRef.current.children[next] as HTMLElement;
      if (card) {
        scrollRef.current.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' });
      }
    }
  };

  const handlePlay = (video: Video) => {
    if (video.youtubeUrl) {
      setPlaying(video._id);
    } else if (video.videoFileUrl) {
      setPlaying(video._id);
    }
  };

  return (
    <section className="py-20 bg-olive-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-wide">Watch & Learn</p>
          <h2 className="text-3xl sm:text-4xl font-medium text-white font-serif mt-2">
            Wellness Video Stories
          </h2>
          <p className="text-primary-100/90 mt-4 max-w-2xl mx-auto text-lg">
            Explore inspiring stories of transformation and growth through our wellness videos.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayVideos.map((video, index) => {
              const ytId = video.youtubeUrl ? getYouTubeId(video.youtubeUrl) : null;
              const thumb = video.thumbnail || (video.youtubeUrl ? getYouTubeThumbnail(video.youtubeUrl) : null);
              const isPlaying = playing === video._id;

              return (
                <div
                  key={video._id}
                  className="flex-shrink-0 w-[85vw] md:w-[600px] lg:w-[700px] snap-center"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-primary-900 shadow-2xl group">
                    {/* Video or Thumbnail */}
                    {isPlaying && ytId ? (
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                          className="w-full h-full"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    ) : isPlaying && video.videoFileUrl ? (
                      <div className="aspect-video">
                        <video
                          src={video.videoFileUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video cursor-pointer" onClick={() => handlePlay(video)}>
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : video.videoFileUrl ? (
                          // No thumbnail uploaded — use the video's first frame as a poster.
                          // preload=metadata + muted lets browsers show frame 0 without playing.
                          <video
                            src={`${video.videoFileUrl}#t=0.1`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-800 to-gray-800" />
                        )}

                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                        {/* Category badge */}
                        {video.category && (
                          <div className="absolute top-5 left-5 flex items-center gap-1.5">
                            <span className="text-amber-400 text-sm">✦</span>
                            <span className="text-white text-sm font-medium">{video.category}</span>
                          </div>
                        )}

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          <h3 className="text-xl md:text-2xl font-medium text-white font-serif leading-tight mb-2">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-2 max-w-lg mb-4">
                              {video.description}
                            </p>
                          )}
                          {(video.youtubeUrl || video.videoFileUrl) && (
                            <button className="px-5 py-2 border border-amber-400 text-amber-400 text-sm font-semibold rounded-full hover:bg-amber-400 hover:text-gray-900 transition-all">
                              Explore More
                            </button>
                          )}
                        </div>

                        {/* Play button */}
                        {(video.youtubeUrl || video.videoFileUrl) && (
                          <div className="absolute top-1/2 right-8 md:right-12 -translate-y-1/2">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <svg className="w-7 h-7 md:w-8 md:h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          {displayVideos.length > 1 && (
            <>
              <button
                onClick={() => scrollTo(current - 1)}
                disabled={current === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollTo(current + 1)}
                disabled={current === displayVideos.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        {displayVideos.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {displayVideos.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current ? 'bg-primary-400 w-8' : 'bg-primary-800 hover:bg-primary-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
