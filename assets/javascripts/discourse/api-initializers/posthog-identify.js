import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.15.0", (api) => {
  // Prüfen, ob der User eingeloggt ist (Standard Discourse API)
  const currentUser = api.getCurrentUser();

  if (currentUser) {
    // Unseren neuen Backend-Endpunkt aufrufen
    ajax("/posthog/identify", { type: "POST" })
      .then((data) => {
        // Hier erfolgt die eigentliche PostHog-Logik
        // posthog.identify(data.id, { 
        //   username: data.username, 
        //   email: data.email 
        // });
        console.log("PostHog: User automatisch identifiziert", data);
      })
      .catch((e) => console.error("PostHog Identify fehlgeschlagen", e));
  }
});