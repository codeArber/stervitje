// src/components/TikTokEmbed.tsx
import React, { useEffect } from "react"

type Props = {
  /** Full TikTok video URL, e.g. "https://www.tiktok.com/@user/video/123" */
  url: string
  /** Optional max width for the embed */
  maxWidthPx?: number
}

export function TikTokEmbed({ url, maxWidthPx = 605 }: Props) {
  // Extract the numeric video ID from the URL
  const match = url.match(/video\/(\d+)/)
  const videoId = match ? match[1] : null

  useEffect(() => {
    if (typeof window === "undefined" || !videoId) return

    // Don’t re-add the script if it’s already on the page
    if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
      const s = document.createElement("script")
      s.src = "https://www.tiktok.com/embed.js"
      s.async = true
      document.body.appendChild(s)
    } else {
      // If script was already loaded, re-parse embeds
      // @ts-expect-error tiktokEmbed is injected globally
      window.tiktokEmbed && window.tiktokEmbed.load && window.tiktokEmbed.load()
    }
  }, [videoId])

  if (!videoId) return <p>Invalid TikTok URL</p>

  return (
    <blockquote
      className="tiktok-embed"
      cite={url}
      data-video-id={videoId}
      style={{
        maxWidth: `${maxWidthPx}px`,
        minWidth: "325px",
      }}
    >
      {/* TikTok’s script will fill this empty section */}
      <section> </section>
    </blockquote>
  )
}
