# frozen_string_literal: true

module DiscoursePosthog
  class EndpointController < ::ApplicationController # rubocop:disable Discourse/Plugins/CallRequiresPlugin
    # Erzwingt Login (liefert 403, wenn nicht eingeloggt)
    before_action :ensure_logged_in, only: :identify

    def status
      render json: {
               status: true,
               posthog_enabled: SiteSetting.enable_discourse_posthog_plugin,
             },
             content_type: "application/json"
    end

    def identify
      hashed_email = Digest::SHA256.hexdigest(current_user.email.downcase)
      render json: {
               id: current_user.id,
               username: current_user.username,
               email: current_user.email,
               hashed_email: hashed_email,
             },
             content_type: "application/json"
    end
  end
end
