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

- [x] CSP kann nicht aktiviert werden. => nonce wird nun richtig gesetzt
- [x] Discourse ist ein SPA (single page application) und die url ändert sich beim scrollen.
- [ ] Tracken von Likes im Forum (vielleicht per api.onAppEvent)
- [ ] Tracken von neuen / beantworteten Topics
- [ ] Hashen der email

## My Local Development Setup

https://meta.discourse.org/t/developing-discourse-plugins-part-1-create-a-basic-plugin/30515?silent=true

lokalen dev container starten...

bundle exec rake admin:create