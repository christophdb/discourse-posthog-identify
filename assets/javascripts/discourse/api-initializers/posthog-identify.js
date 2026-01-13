import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.15.0", (api) => {
  // Prüfen, ob der User eingeloggt ist (Standard Discourse API)
  const currentUser = api.getCurrentUser();

  if (currentUser) {
    // Eindeutiger Key für diesen User in dieser Session
    const storageKey = `posthog_identified_${currentUser.id}`;

    // Nur ausführen, wenn wir es in dieser Session noch nicht getan haben
    if (!sessionStorage.getItem(storageKey)) {
      ajax("/posthog/identify", { type: "POST" })
        .then((data) => {
          // Hier PostHog Logik einfügen
          // posthog.identify(data.id, { email: data.email });

          // Markierung setzen, damit der Request nicht erneut feuert
          sessionStorage.setItem(storageKey, "true");
          console.log("PostHog: User neu identifiziert und für Session gespeichert.");
        })
        .catch((e) => {
          // Bei Fehlern (z.B. 403) löschen wir den Key sicherheitshalber nicht,
          // damit es beim nächsten Laden erneut versucht werden kann.
          console.error("PostHog Identify fehlgeschlagen", e);
        });
    } else {
      // Optional: Nur für Ihr Debugging
      console.log("PostHog: User in dieser Session bereits identifiziert.");
    }
  }
});