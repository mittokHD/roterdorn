import { sanitizeHtml } from "./sanitize";

const YOUTUBE_ID_PATTERN = "[A-Za-z0-9_-]{11}";
const YOUTUBE_URL_PATTERN = `https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?[^\\s<]*?v=(${YOUTUBE_ID_PATTERN})[^\\s<]*|youtu\\.be\\/(${YOUTUBE_ID_PATTERN})[^\\s<]*)`;

const paragraphYoutubeRegex = new RegExp(`<p>\\s*(${YOUTUBE_URL_PATTERN})\\s*<\\/p>`, "gi");
const standaloneYoutubeRegex = new RegExp(`(^|\\n)\\s*(${YOUTUBE_URL_PATTERN})\\s*(?=\\n|<h[1-6]|$)`, "gi");

function youtubeEmbed(videoId: string) {
  return `<figure class="review-video-embed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/${videoId}"
    title="YouTube video player"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</figure>`;
}

function normalizeWordPressCaptions(html: string) {
  return html.replace(
    /\[caption([^\]]*)\]([\s\S]*?)\[\/caption\]/gi,
    (_, attrs: string, body: string) => {
      const imageMatch = body.match(/<img\b[^>]*>/i);
      if (!imageMatch) return body;

      const image = imageMatch[0];
      const align = attrs.match(/\balign=["']?(align(?:left|right|center|none))["']?/i)?.[1];
      const width = attrs.match(/\bwidth=["']?(\d{1,4})["']?/i)?.[1];
      const classes = ["wp-caption", align].filter(Boolean).join(" ");
      const style = width ? ` style="max-width: ${Number(width)}px"` : "";
      const caption = body
        .replace(image, "")
        .replace(/^\s+|\s+$/g, "");

      return `<figure class="${classes}"${style}>${image}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    },
  );
}

function embedYouTubeLinks(html: string) {
  const replaceWithEmbed = (_match: string, prefixOrUrl: string, fullUrlOrId: string, id1?: string, id2?: string) => {
    const prefix = prefixOrUrl.startsWith("http") ? "" : prefixOrUrl;
    const videoId = id1 || id2 || fullUrlOrId;
    return `${prefix}${youtubeEmbed(videoId)}`;
  };

  return html
    .replace(paragraphYoutubeRegex, (_match, _url, id1, id2) => youtubeEmbed(id1 || id2))
    .replace(standaloneYoutubeRegex, replaceWithEmbed);
}

export function renderReviewHtml(html: string) {
  return embedYouTubeLinks(sanitizeHtml(normalizeWordPressCaptions(html)));
}
