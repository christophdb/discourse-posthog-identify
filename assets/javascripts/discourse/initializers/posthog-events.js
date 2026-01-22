/* eslint-disable no-console */
import { ajax } from "discourse/lib/ajax";
import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  const currentUser = api.getCurrentUser();
  let lastTopicId = null;

  // initialize
  const posthog = window.posthog;

  console.debug("🦔 PostHog Initializer gestartet");

  // 1. USER IDENTIFICATION
  if (currentUser) {
    const storageKey = `posthog_identified_${currentUser.id}`;
    console.debug(
      "🦔 PostHog Identify started. Current storageKey:",
      storageKey
    );

    // Nur ausführen, wenn wir es in dieser Session noch nicht getan haben
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/discourse-posthog/identify", { type: "POST" })
        .then((data) => {
          posthog.identify(data.email, {
            email: data.email,
            id: data.id,
            username: data.username,
          });
          sessionStorage.setItem(storageKey, "true");
          console.debug("🦔 Posthog Identify send");
        })
        .catch((e) => console.error("🦔❌ PostHog Identify fehlgeschlagen", e));
    }
  }

  // 2. PAGEVIEW TRACKING (SPA-kompatibel)
  api.onPageChange((url, title) => {
    if (!window.posthog) {
      return;
    }

    // Extrahiere Topic ID aus der URL (Format: /t/slug/ID/post_number)
    const topicMatch = url.match(/\/t\/[^\/]+\/(\d+)/);

    if (topicMatch) {
      const currentTopicId = topicMatch[1];

      // Nur tracken, wenn es ein neues Topic ist (nicht beim Scrollen durch Posts)
      if (currentTopicId !== lastTopicId) {
        posthog.capture("$pageview", {
          topic_id: currentTopicId,
          title,
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

  // ✅ Topic Creation Events
  api.onAppEvent("topic:created", (topicData) => {
    posthog.capture("discourse_topic_created", {
      topic_id: topicData.topic_id,
      topic_title: topicData.title,
    });
    console.debug("🦔✅ Posthog event discourse_topic_created");
  });

  api.onAppEvent("post:created", (topicData) => {
    console.log(topicData);
    posthog.capture("discourse_topic_answered", {
      topic_id: topicData.topic_id,
    });
    console.debug("🦔✅ Posthog event discourse_topic_answered");
  });

  // hier entwickel ich gerade
  console.log("lets dev");

  // der folgende code geht nicht...

  // 3. LIKE Tracking
  // ✅ DOM Event Delegation für Like Buttons
  api.onAppEvent("post-actions:liked", (data) => {
    console.debug("LIKE");

    window.posthog?.capture("post_liked", {
      post_id: data.id,
      topic_id: data.topicId,
    });
  });

  // 🔥 DISCOURSE 2026 NEUESTE FEATURES - Event Hooks
  // 1. TOPIC ERSTELLUNG (neueste Discourse TopicCreatedEvent)
  /*
  api.addModelClassCallback('topic', {
    afterCreate(topic) {
      posthog.capture('topic_created', {
        topic_id: topic.id,
        title: topic.title,
        category_id: topic.category_id
      });
      console.log('capture: discourse_topic_created')
    }
  });
  */
});
