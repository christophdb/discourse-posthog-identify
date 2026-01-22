# Discourse PostHog

This plugin integrates Discourse with PostHog, sending events like pageviews, topic/post creation, and likes. It supports anonymous tracking, email-based identification, or SHA256-hashed emails via a custom Discourse endpoint.

## Features

- **Events**: pageview, pageleave, create topic, create post, like/unlike post
- **Privacy levels of the event tracking**: anonymous, user email, hashed email

## Why this plugin?

While adding PostHog's JavaScript snippet directly to Discourse's `<head>` provides basic page tracking, this plugin addresses three fundamental limitations that make it far more powerful for serious analytics.

### 1. Discourse is a SPA (Single Page Application)

When users scroll through long topics with dozens of posts, the standard snippet fires multiple pageview events for the same topic:

- /t/admin-guide-getting-started/6 ← Initial load
- /t/admin-guide-getting-started/6/3 ← Scroll to post #3
- /t/admin-guide-getting-started/6/5 ← Scroll to post #5

This floods your analytics with duplicate pageviews that don't reflect actual user behavior. The plugin intelligently tracks a single `pageview` per topic visit plus `pageleave` events, giving you clean, meaningful data.

### 2. You have pageviews but no events

Pageviews alone don't capture what matters most. The most valuable user actions are `creating topics`, `writing posts`, `liking/unliking content`. These will never appear in basic tracking. You see "100 pageviews" but have no idea if those visits resulted in 3 new topics, 15 posts, and 42 likes. 

This plugin captures these critical business events as distinct, actionable data points that reveal your community's true engagement patterns.

### 3. No user identification

The basic snippet provides no user identification. Discourse's SPA architecture blocks direct access to user information, leaving you with anonymous browser IDs (`$distinct_id: "abc123xyz"`) instead of real usernames, emails, or avatars. 

This plugin creates a secure internal API endpoint (`/discourse-posthog/identify`) that provides rich user context—user ID, username, email and hashed email (SHA256), while remaining fully GDPR compliant with configurable anonymization levels.

The end result is analytics that go beyond raw traffic numbers to deliver genuine insights into your Discourse community's behavior and growth.

## Production Installation

### 1. Load plugin

Edit `containers/app.yml` and add this code:


```yaml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          # ... existing plugins ...
          - git clone https://github.com/christophdb/discourse-posthog.git
```

### 2. Rebuild container

```bash
cd /var/discourse
./launcher rebuild app
```

### 3. Enable plugin

- Go to `Admin` → `Plugins` → Enable "discourse-posthog"
- Add your `POSTHOG_API_KEY`. Update the other settings, if needed.

### 4. Verify

Open the browser console and change the output to `verbose`. Now you will see log message from the plugin.

```
🦔 PostHog Initializer gestartet
🦔✅ Posthog $pageview capture for a page
```

## Local Development (VSCode DevContainer)

### Workspace Setup

```bash
mkdir discourse-dev && cd discourse-dev
git clone https://github.com/christophdb/discourse-posthog.git
git clone https://github.com/discourse/discourse.git
code discourse
```

### Directory structure:

```
discourse-dev/
├── discourse/           ← Discourse Core (workspaceMount)
└── discourse-posthog/   ← Plugin (separate mount)
```

### Extend .devcontainer/devcontainer.json

```bash
"source=${localWorkspaceFolder}/../discourse-posthog,target=${containerWorkspaceFolder}/plugins/discourse-posthog,type=bind,consistency=cached"
```

### Start sequence

Inside visual studio code, start the dev container. You will find the plugin in `plugins/discourse-posthog`.

Open your browser and open `http://localhost:4200`.

### Initial Admin User

After the first start of discourse you need to create an initial admin user with `bundle exec rake admin:create`.

### Development

The Mount ensures local plugin changes are immediately visible in container.