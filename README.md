# Discourse PostHog Integration

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
