"use client";

import { useEffect } from "react";

export function WeKnoraChat() {
  useEffect(() => {
    let script: HTMLScriptElement | undefined;
    fetch("/api/weknora/config").then((response) => response.json()).then((config) => {
      if (!config.enabled) return;
      script = document.createElement("script");
      script.src = `${config.baseUrl}/weknora-widget.js`;
      script.dataset.channel = config.channelId;
      script.dataset.tokenEndpoint = "/api/weknora/embed-token";
      script.dataset.position = "bottom-right";
      script.dataset.primaryColor = "#176b4d";
      script.dataset.title = "向 Passway 提问";
      document.body.appendChild(script);
    }).catch(() => undefined);
    return () => { script?.remove(); };
  }, []);
  return null;
}
