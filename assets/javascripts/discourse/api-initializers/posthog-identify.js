import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";


export default apiInitializer("1.15.0", (api) => {
  const currentUser = api.getCurrentUser();
  let lastTopicId = null;

  console.log("lets do some programming...");

  // 1. USER IDENTIFICATION
  if (currentUser) {
    const storageKey = `posthog_identified_${currentUser.id}`;

    // Nur ausführen, wenn wir es in dieser Session noch nicht getan haben
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/posthog/identify", { type: "POST" })
        .then(async (data) => {
          // SHA256 Hash-Funktion (Browser Crypto API)
          const sha256 = async (str) => {
            const msgBuffer = new TextEncoder().encode(str.toLowerCase());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          };

          const emailHash = await sha256(data.email);

          posthog.identify(emailHash, { 
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

  // ✅ 1. TOPIC ERSTELLT - TopicMap Widget Hook (funktioniert immer)
  api.decorateWidget("topic-map:before", helper => {
    const topic = helper.attrs;
    // Topic-Status: 1 = neu erstellt
    if (topic.created_at === topic.bumped_at && !topic.closed) {
      posthog.capture('topic_created', {
        topic_id: topic.id,
        title: topic.fancy_title,
        category_id: topic.category_id,
        slug: topic.slug
      });
      console.log('✅ Topic created:', topic.id);
    }
  });

  // ✅ 2. POST/ANTWORT - PostWidget Hook  
  api.decorateWidget("post:before", helper => {
    const post = helper.attrs;
    // Nur neue Posts (created == updated)
    if (post.created_at === post.updated_at) {
      setTimeout(() => {
        posthog.capture('post_created', {
          post_id: post.id,
          topic_id: post.topic_id,
          post_number: post.post_number,
          username: post.username
        });
        console.log('✅ Post created:', post.id);
      }, 100);
    }
  });

  // ✅ 3. LIKE - LikeButton Widget (100% zuverlässig)
  api.attachWidgetBehavior(".like-action", {
    events: {
      click() {
        // aria-pressed=true bedeutet "geliked"
        setTimeout(() => {
          if (this.element.getAttribute('aria-pressed') === 'true') {
            const postId = this.attrs.id || 
                          this.element.closest('[data-post-id]')?.dataset.postId;
            posthog.capture('like_given', {
              post_id: postId,
              topic_id: this.currentTopicContext?.id
            });
            console.log('✅ Like given:', postId);
          }
        }, 50);
      }
    }
  });

});