"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

import { META_PIXEL_ID, trackMetaPixel } from "@/lib/metaPixel";

const isTrackablePath = (pathname: string | null) =>
  Boolean(pathname) && !pathname?.startsWith("/admin");

export default function MetaPixel() {
  const pathname = usePathname();
  const initialPageViewHandled = useRef(false);
  const shouldTrack = useMemo(() => isTrackablePath(pathname), [pathname]);

  useEffect(() => {
    if (!shouldTrack) return;

    if (!initialPageViewHandled.current) {
      initialPageViewHandled.current = true;
      return;
    }

    trackMetaPixel("PageView");
  }, [shouldTrack, pathname]);

  if (!META_PIXEL_ID || !shouldTrack) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
