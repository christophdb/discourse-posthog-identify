# Discourse PostHog

Enables PostHog `identify()` calls **with email as distinct_id** after login.

## Features

- Server-side email proxy (`/posthog/identify`)
- GDPR compliant (only own email)
- Works with SSO + standard accounts

## Installation

**Edit `containers/app.yml`:**

```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          # ... existing plugins ...
          - git clone https://github.com/christophdb/discourse-posthog-identify.git
```

## ToDo

[x] CSP kann nicht aktiviert werden. => nonce wird nun richtig gesetzt
[x] Discourse ist ein SPA (single page application) und die url ändert sich beim scrollen.
[ ] Tracken von Likes im Forum (vielleicht per api.onAppEvent)
[ ] Tracken von neuen / beantworteten Topics
[ ] Hashen der email

## My Local Development Setup

**Einmalig**

1. Ordner anlegen: /plugins/discourse-posthog-identify
2. Git clone oder Dateien kopieren
3. `./launcher rebuild app` (einmal)

**In plugin.rb ganz oben einfügen**

```
if Rails.env.development?
  PRELOAD_PLUGINS = false
  DiscoursePluginRegistry.development_mode = true
end
```

**Ab jetzt: Hot-Reload der JS-Dateien**

1. posthog-identify.js bearbeiten
2. Ctrl+S speichern  
3. Browser: F5 drücken
4. ✅ JS-Änderungen sofort live!

**Wichtig** Das funktioniert nicht mit Änderungen an der plugin.rb. Dafür muss trotzdem immer neu gebaut werden:

`./launcher rebuild app`