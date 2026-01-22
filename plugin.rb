# frozen_string_literal: true

# name: discourse-posthog
# about: PostHog Analytics Integration. Captures pageviews, topic/post creation, likes/unlikes. Supports anonymous or identified user tracking via server-side identify endpoint.
# version: 0.3
# authors: Christoph Dyllick-Brenzinger
# url: https://github.com/christophdb/discourse-posthog

enabled_site_setting :enable_discourse_posthog_plugin

after_initialize do
  require_relative "app/controllers/discourse_posthog/endpoint_controller"

  Discourse::Application.routes.append do
    post "/discourse-posthog/identify" => "discourse_posthog/endpoint#identify"
    get "/discourse-posthog/status" => "discourse_posthog/endpoint#status"
  end

  register_html_builder("server:before-head-close") do |controller|
    next "" unless SiteSetting.enable_discourse_posthog_plugin

    api_host = SiteSetting.posthog_api_host
    ui_host = SiteSetting.posthog_ui_host
    api_key = SiteSetting.posthog_api_key
    feature_disable_surveys = SiteSetting.posthog_feature_disable_surveys
    feature_disable_session_recording = SiteSetting.posthog_feature_disable_session_recording
    cookie_expiration_in_days = SiteSetting.posthog_cookie_expiration_in_days
    api_version = SiteSetting.api_version

    <<~HTML
    <script nonce='#{controller.helpers.csp_nonce_placeholder}'>
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init rs ls yi ns us ts ss capture Hi calculateEventProperties vs register register_once register_for_session unregister unregister_for_session gs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty fs ds createPersonProfile ps Qr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing hs debug O cs getPageViewId captureTraceFeedback captureTraceMetric Kr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('#{api_key}', {
          api_host: '#{api_host}',
          ui_host: '#{ui_host}',
          defaults: '#{api_version}',
          cookie_expiration: #{cookie_expiration_in_days},
          disable_surveys: #{feature_disable_surveys},
          disable_session_recording: #{feature_disable_session_recording},
          disable_session_recording_heatmaps: #{feature_disable_session_recording},
          autocapture: false,
          capture_pageleave: true,
          person_profiles: 'identified_only',
          // pageviews are deactivated, otherwise multiple pageviews per topic /t/topic/5690 und /t/topic/5690/4
          // pageviews are captured in posthog-events.js
          capture_pageview: false,
      });
    </script>
    HTML
  end
end
