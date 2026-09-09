"use client";

import Script from "next/script";

export function WeKnoraChat({ baseUrl, channelId }: { baseUrl?: string; channelId?: string }) {
  if (!baseUrl || !channelId) return null;
  return <Script
    src={`${baseUrl.replace(/\/$/, "")}/weknora-widget.js`}
    data-channel={channelId}
    data-token-endpoint="/api/weknora/embed-token"
    data-position="bottom-right"
    data-primary-color="#176b4d"
    data-title="向 Passway 提问"
    strategy="afterInteractive"
  />;
}
