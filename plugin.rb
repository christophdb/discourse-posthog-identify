# name: discourse-posthog-identify
# about: Registers a POST-endpoint for PostHog user identification
# version: 1.1.1
# authors: Christoph Dyllick-Brenzinger
# url: https://github.com/christophdb/discourse-posthog-identify

enabled_site_setting :posthog_identify_enabled

after_initialize do
  module ::PosthogIdentify
    class IdentifyController < ::ApplicationController
      # Erzwingt Login (liefert 403, wenn nicht eingeloggt)
      before_action :ensure_logged_in
      
      def identify
        render json: {
          id: current_user.id,
          username: current_user.username,
          email: current_user.email
        }
      end
    end
  end

  Discourse::Application.routes.append do
    post "/posthog/identify" => "posthog_identify/identify#identify"
  end

  register_html_builder('server:before-head-close') do |controller|
    # Skript nur einfügen, wenn das Plugin in den Einstellungen aktiviert ist
    next "" unless SiteSetting.posthog_identify_enabled

    # Variablen aus den SiteSettings ziehen
    api_host = SiteSetting.posthog_api_host
    ui_host = SiteSetting.posthog_ui_host
    api_key = SiteSetting.posthog_api_key

    <<~HTML
    <script nonce='#{controller.helpers.csp_nonce_placeholder}'>
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init rs ls yi ns us ts ss capture Hi calculateEventProperties vs register register_once register_for_session unregister unregister_for_session gs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty fs ds createPersonProfile ps Qr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing hs debug O cs getPageViewId captureTraceFeedback captureTraceMetric Kr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('#{api_key}', {
          api_host: '#{api_host}',
          ui_host: '#{ui_host}',
          defaults: '2025-11-30',
          cookie_expiration: 90,
          disable_surveys: true,
          disable_session_recording: true,
          disable_session_recording_heatmaps: true,
          autocapture: false,
          capture_pageleave: false,
          person_profiles: 'identified_only',
          // pageviews are deactivated, otherwise multiple payviews per topic /t/topic/5690 und /t/topic/5690/4
          capture_pageview: false,
      });
    </script>
    HTML
  end
end