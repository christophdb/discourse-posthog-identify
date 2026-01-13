# name: discourse-posthog-identify
# about: Registers a POST-endpoint for PostHog user identification
# version: 1.0.1
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
end