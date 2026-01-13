# name: discourse-posthog
# about: PostHog identify endpoint for Discourse
# version: 1.0.0
# authors: Christoph Dyllick-Brenzinger
# url: https://github.com/christophdb/discourse-posthog-identify

enabled = true
after_initialize do
  Discourse::Application.routes.append do
    post "/posthog/identify" => "posthog#identify"
  end
  
  # Optional: Admin Panel
  add_admin_route "posthog.title", "/admin/plugins/posthog"
end