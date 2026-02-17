import { useEffect, useRef } from 'react';

interface AdBannerProps {
    className?: string;
    style?: React.CSSProperties;
    dataAdSlot: string;
    dataAdFormat?: string;
    dataFullWidthResponsive?: boolean;
}

export default function AdBanner({
    className,
    style,
    dataAdSlot,
    dataAdFormat = 'auto',
    dataFullWidthResponsive = true
}: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // Check if window.adsbygoogle exists, if not initialize it
            const adsbygoogle = (window as any).adsbygoogle || [];
            // Push the new ad
            adsbygoogle.push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`text-center my-4 ${className || ''}`} style={style}>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Advertisement</p>
            <ins
                className="adsbygoogle block"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE WITH YOUR PUBLISHER ID
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
                ref={adRef}
            />
        </div>
    );
}
