# frozen_string_literal: true

module DiscoursePosthog
  class EndpointController < ::ApplicationController # rubocop:disable Discourse/Plugins/CallRequiresPlugin
    # Erzwingt Login (liefert 403, wenn nicht eingeloggt)
    before_action :ensure_logged_in, only: :identify

    def status
      render json: {
               status: true,
               posthog_enabled: SiteSetting.posthog_identify_enabled,
             },
             content_type: "application/json"
    end

    def identify
      render json: {
               id: current_user.id,
               username: current_user.username,
               email: current_user.email,
             },
             content_type: "application/json"
    end
  end
end
