import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.15.0", (api) => {
  const currentUser = api.getCurrentUser();
  let lastTopicId = null;

  // 1. USER IDENTIFICATION
  if (currentUser) {
    const storageKey = `posthog_identified_${currentUser.id}`;

    // Nur ausführen, wenn wir es in dieser Session noch nicht getan haben
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/posthog/identify", { type: "POST" })
        .then((data) => {
          posthog.identify(data.email, { 
            email: data.email ,
            id: data.id,
            username: data.username
          });
          sessionStorage.setItem(storageKey, "true");
        })
        .catch((e) => console.error("PostHog Identify fehlgeschlagen", e));
    }
  }

  // 2. PAGEVIEW TRACKING (SPA-kompatibel)
  api.onPageChange((url, title) => {
    if (!window.posthog) return;

    // Extrahiere Topic ID aus der URL (Format: /t/slug/ID/post_number)
    const topicMatch = url.match(/\/t\/[^\/]+\/(\d+)/);
    
    if (topicMatch) {
      const currentTopicId = topicMatch[1];

      // Nur tracken, wenn es ein neues Topic ist (nicht beim Scrollen durch Posts)
      if (currentTopicId !== lastTopicId) {
        posthog.capture('$pageview', {
          topic_id: currentTopicId,
          url: url
        });
        lastTopicId = currentTopicId;
      }
    } else {
      // Für alle anderen Seiten (Suche, Profil, Kategorien)
      lastTopicId = null; 
      posthog.capture('$pageview');
    }
  });

});