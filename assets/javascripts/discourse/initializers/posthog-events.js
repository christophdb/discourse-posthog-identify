/* eslint-disable no-console */
import { ajax } from "discourse/lib/ajax";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const currentUser = api.getCurrentUser();
  let lastTopicId = null;

  // site settings
  const settings = api.container.lookup("service:site-settings");
  const identifyMethod = settings.posthog_identify_user_by || "";

  // initialize
  const posthog = window.posthog;

  console.debug("🦔 PostHog Initializer gestartet");

  // 1. user identification
  if (currentUser && identifyMethod !== "No User Identification" ) {
    const storageKey = `posthog_identified_${currentUser.id}`;
    console.debug(
      "🦔 PostHog Identify started. Current storageKey:",
      storageKey
    );

    // identify only once per session
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/discourse-posthog/identify", { type: "POST" })
        .then((data) => {
          const identify_with = identifyMethod === "Email" ? data.email : data.hashed_email; 
          console.debug("Identify with", identify_with);

          posthog.identify(identify_with, {
            discourse_email: identify_with,
            discourse_id: data.id,
            discourse_username: data.username,
          });
          sessionStorage.setItem(storageKey, "true");
          console.debug("🦔 Posthog Identify send");
        })
        .catch((e) => console.error("🦔❌ PostHog Identify fehlgeschlagen", e));
    }
  }

  // 2. PAGEVIEW TRACKING (needed for single-page-application)
  api.onPageChange((url, title) => {
    if (!window.posthog) {
      return;
    }

    // extract topic id from URL (Format: /t/slug/ID/post_number)
    const topicMatch = url.match(/\/t\/[^\/]+\/(\d+)/) || 0;

    if (topicMatch) {
      const currentTopicId = topicMatch[1];

      // track only if it is a new topic, scrolling should not be tracked
      if (currentTopicId !== lastTopicId) {
        posthog.capture("$pageview", {
          discourse_topic_id: currentTopicId,
          discourse_title: title,
          url,
        });
        lastTopicId = currentTopicId;
        console.debug("🦔✅ Posthog $pageview capture for a topic");
      }
    } else {
      // Für alle anderen Seiten (Suche, Profil, Kategorien)
      lastTopicId = null;
      posthog.capture("$pageview");
      console.debug("🦔✅ Posthog $pageview capture for a page");
    }
  });

  // 3. EVENT Tracking
  api.onAppEvent("topic:created", (data) => {
    posthog.capture("discourse_topic_created", {
      discourse_topic_id: data.topic_id,
      discourse_title: data.title,
      discourse_slug: data.slug,
    });
    console.debug("🦔✅ Posthog event discourse_topic_created");
  });

  api.onAppEvent("post:created", (data) => {
    console.log(data);
    posthog.capture("discourse_post_created", {
      discourse_topic_id: data.topic_id,
      discourse_slug: data.slug,
    });
    console.debug("🦔✅ Posthog event discourse_post_created");
  });

  api.onAppEvent("page:like-toggled", (data) => {
    const topicId = data.post_url.match(/\/t\/[^\/]+\/(\d+)/) || 0;

    if (data.actionByName?.like?.acted) {
      posthog.capture("discourse_post_liked", {
        discourse_topic_id: topicId,
      });
      console.debug("🦔✅ Posthog event discourse_post_liked");
    } else {
      posthog.capture("discourse_post_unliked", {
        discourse_topic_id: topicId,
      });
      console.debug("🦔✅ Posthog event discourse_post_unliked");
    }
  });
});
