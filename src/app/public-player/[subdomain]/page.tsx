'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Play, Pause, Power, Radio, ListMusic, MonitorPlay, X, Youtube } from 'lucide-react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter, FaGlobe } from 'react-icons/fa6';
import { ModuleRenderer } from '@/components/builder/ModuleRenderer';
import { DEFAULT_LAYOUT } from '@/types/layout';

export default function PublicPlayer() {
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [currentStandardBannerIndex, setCurrentStandardBannerIndex] = useState(0);
    const [showOverlayBanner, setShowOverlayBanner] = useState(false);
    const [overlayBannerData, setOverlayBannerData] = useState<any>(null);
    const [showSplash, setShowSplash] = useState(true);
    const [showProgramsModal, setShowProgramsModal] = useState(false);
    const [showVideosModal, setShowVideosModal] = useState(false);
    const [programFilter, setProgramFilter] = useState('Todos');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        if (!subdomain) return;

        fetch(`/api/config?subdomain=${subdomain}`)
            .then((res) => {
                if (!res.ok) throw new Error('Radio not found');
                return res.json();
            })
            .then((data) => {
                if (!data.social) data.social = [];
                if (!data.theme.backgroundEffect) data.theme.backgroundEffect = { blur: 0, opacity: 1, movement: false };
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [subdomain]);

    useEffect(() => {
        if (config?.template === 'card') {
            const timer = setTimeout(() => setShowSplash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [config]);

    useEffect(() => {
        if (!config) return;
        const standardBanners = config.banners?.filter((b: any) => b.type === 'standard') || [];
        if (standardBanners.length === 0) return;

        const interval = setInterval(() => {
            setCurrentStandardBannerIndex((prev) => (prev + 1) % standardBanners.length);
        }, (config.bannerRotationSeconds || 10) * 1000);

        return () => clearInterval(interval);
    }, [config]);

    useEffect(() => {
        if (!config) return;
        const fullscreenBanners = config.banners?.filter((b: any) => b.type === 'fullscreen') || [];
        if (fullscreenBanners.length === 0) return;

        const showBanner = () => {
            const randomBanner = fullscreenBanners[Math.floor(Math.random() * fullscreenBanners.length)];
            setOverlayBannerData(randomBanner);
            setShowOverlayBanner(true);

            setTimeout(() => {
                setShowOverlayBanner(false);
            }, (randomBanner.frequency || 10) * 1000);
        };

        const firstDelay = Math.random() * 30000 + 10000;
        const firstTimer = setTimeout(showBanner, firstDelay);

        const interval = setInterval(() => {
            showBanner();
        }, 60000);

        return () => {
            clearTimeout(firstTimer);
            clearInterval(interval);
        };
    }, [config]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
    }, [volume]);

    const togglePlay = () => {
        if (!audioRef.current || !config) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.src = config.streamUrl;
            audioRef.current.play().catch(err => console.error('Error playing audio:', err));
            setIsPlaying(true);
        }
    };

    const exitApp = () => {
        if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_APP' }));
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white text-lg">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center text-white">
                    <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h1 className="text-2xl font-bold mb-2">Radio no encontrada</h1>
                    <p className="text-slate-400">El subdominio "{subdomain}" no existe</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <audio ref={audioRef} />

            {/* 1. Base Background Color Layer (Always Opaque) */}
            <div
                className="absolute inset-0 z-[-2]"
                style={{ backgroundColor: config.theme?.backgroundColor || '#000' }}
            />

            {/* 2. Background Image Layer (With Opacity & Blur) */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 z-[-1]"
                style={{
                    backgroundImage: config.theme.backgroundImageUrl ? `url(${config.theme.backgroundImageUrl})` : 'none',
                    filter: `blur(${config.theme.backgroundEffect?.blur || 0}px)`,
                    opacity: config.theme.backgroundEffect?.opacity || 1,
                }}
            />

            {/* 3. Gradient Overlay */}
            {config.theme.backgroundEffect?.gradient !== false && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0" />
            )}

            {/* Splash Screen - Only for Card Template */}
            {showSplash && config.template === 'card' && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-1000 animate-in fade-in">
                    <img src={config.theme.logoUrl} alt="Logo" className="w-48 h-48 object-contain animate-pulse mb-8" />
                    {config.splashAuthor && (
                        <p className="absolute bottom-10 text-sm text-gray-500 font-light tracking-wide">{config.splashAuthor}</p>
                    )}
                </div>
            )}

            {/* Main Content - Dynamic or Legacy Templates */}
            {config.layout ? (
                // NEW: Dynamic Module System
                <div className="relative z-10 flex h-[100dvh] flex-col items-center justify-between p-6 pt-12 text-white overflow-hidden max-w-[480px] mx-auto">
                    {/* Exit Button - Hidden in WebView/Mobile App */}
                    {typeof window !== 'undefined' && !navigator.userAgent.includes('wv') && (
                        <div
                            className="absolute right-4 top-4 p-2 opacity-80 cursor-pointer hover:opacity-100 hover:bg-white/10 rounded-full transition-all z-50"
                            onClick={exitApp}
                        >
                            <Power className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                    )}

                    {/* Render Modules Dynamically */}
                    <div className={`flex flex-col items-center justify-center gap-${config.layout.globalSpacing || 4} w-full flex-1`}>
                        {config.layout.modules
                            .filter((m: any) => m.enabled)
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((module: any) => (
                                <ModuleRenderer
                                    key={module.id}
                                    module={module}
                                    config={config}
                                    isPlaying={isPlaying}
                                    volume={volume}
                                    onTogglePlay={togglePlay}
                                    onVolumeChange={setVolume}
                                />
                            ))}
                    </div>
                </div>
            ) : config.template === 'card' ? (
                // LEGACY: Card Template
                <div className="relative z-10 flex h-[100dvh] flex-col items-center justify-between p-6 pt-12 text-white overflow-hidden max-w-[480px] mx-auto">
                    {typeof window !== 'undefined' && !navigator.userAgent.includes('wv') && (
                        <div
                            className="absolute right-4 top-4 p-2 opacity-80 cursor-pointer hover:opacity-100 hover:bg-white/10 rounded-full transition-all"
                            onClick={exitApp}
                        >
                            <Power className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-4 w-full flex-1">
                        <div className="bg-white rounded-3xl p-5 shadow-2xl">
                            <img
                                src={config.theme.logoUrl}
                                alt="Station Logo"
                                className="w-28 h-28 object-contain"
                            />
                        </div>

                        <div className="text-center space-y-1">
                            <h1 className="text-xl font-bold drop-shadow-lg">{config.stationName}</h1>
                            <p className="text-sm opacity-90 drop-shadow-md">{config.slogan}</p>
                        </div>

                        <button
                            onClick={togglePlay}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 shadow-2xl transition-transform hover:scale-105 active:scale-95"
                        >
                            {isPlaying ? (
                                <Pause className="h-8 w-8 text-white" fill="white" />
                            ) : (
                                <Play className="h-8 w-8 text-white ml-0.5" fill="white" />
                            )}
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-4 w-full max-w-xs">
                            <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                            />
                            <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {config.social.slice(0, 4).map((s: any, i: number) => (
                                <a
                                    key={i}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    {s.platform === 'facebook' && <FaFacebook className="h-5 w-5 text-white" />}
                                    {s.platform === 'instagram' && <FaInstagram className="h-5 w-5 text-white" />}
                                    {s.platform === 'whatsapp' && <FaWhatsapp className="h-5 w-5 text-white" />}
                                    {s.platform === 'twitter' && <FaXTwitter className="h-5 w-5 text-white" />}
                                    {s.platform === 'website' && <FaGlobe className="h-5 w-5 text-white" />}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center space-y-1 pb-6">
                        <p className="text-xs opacity-60">{config.footerText}</p>
                        {config.creditsText && (
                            <p className="text-[10px] opacity-40">{config.creditsText}</p>
                        )}
                    </div>
                </div>
            ) : (
                // LEGACY: Classic Template
                <div className="relative z-10 flex h-[100dvh] flex-col items-center justify-center gap-6 p-6 pt-12 text-white overflow-hidden max-w-[600px] mx-auto">
                    {typeof window !== 'undefined' && !navigator.userAgent.includes('wv') && (
                        <div
                            className="absolute right-4 md:right-6 top-4 md:top-6 p-3 opacity-70 hover:opacity-100 cursor-pointer hover:bg-white/10 rounded-full transition-all z-20"
                            onClick={exitApp}
                        >
                            <Power className="h-6 w-6 text-white drop-shadow-lg" />
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center w-full gap-8 md:gap-10">
                        {/* Logo */}
                        <div className="bg-white rounded-3xl p-5 shadow-2xl">
                            <img
                                src={config.theme.logoUrl}
                                alt="Station Logo"
                                className="w-28 h-28 object-contain"
                            />
                        </div>

                        {/* Title & Slogan */}
                        <div className="flex flex-col items-center text-center space-y-2 max-w-md">
                            <h1 className="text-2xl md:text-3xl font-bold drop-shadow-2xl leading-tight px-4">{config.stationName}</h1>
                            <p className="text-sm md:text-base opacity-90 drop-shadow-lg font-medium">{config.slogan}</p>
                        </div>

                        {/* Play Button */}
                        <button
                            onClick={togglePlay}
                            className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95"
                            style={{ backgroundColor: config.theme.primaryColor }}
                        >
                            {isPlaying ? (
                                <Pause className="h-8 w-8 text-white" fill="white" />
                            ) : (
                                <Play className="h-8 w-8 text-white ml-0.5" fill="white" />
                            )}
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-4 w-full max-w-md px-4">
                            <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume * 100}
                                onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                            />
                            <svg className="h-5 w-5 text-white/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {config.social.slice(0, 5).map((s: any, i: number) => (
                                <a
                                    key={i}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    {s.platform === 'facebook' && <FaFacebook className="h-5 w-5 text-white" />}
                                    {s.platform === 'instagram' && <FaInstagram className="h-5 w-5 text-white" />}
                                    {s.platform === 'whatsapp' && <FaWhatsapp className="h-5 w-5 text-white" />}
                                    {s.platform === 'twitter' && <FaXTwitter className="h-5 w-5 text-white" />}
                                    {s.platform === 'website' && <FaGlobe className="h-5 w-5 text-white" />}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Banner Overlay */}
            {showOverlayBanner && overlayBannerData && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative max-w-2xl w-full mx-4">
                        <button
                            onClick={() => setShowOverlayBanner(false)}
                            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                        {overlayBannerData.url ? (
                            <a href={overlayBannerData.url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={overlayBannerData.imageUrl}
                                    alt="Banner"
                                    className="w-full rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform"
                                />
                            </a>
                        ) : (
                            <img
                                src={overlayBannerData.imageUrl}
                                alt="Banner"
                                className="w-full rounded-2xl shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
