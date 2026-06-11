import type { RouteConfigEntry } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

const routes: RouteConfigEntry[] = [
  index("./page.jsx"),
  route("blog", "./blog/page.jsx"),
  route("blog/:blogSlug", "./blog/[blogSlug]/page.jsx"),
  route("contact", "./contact/page.jsx"),
  route("errors/async-effect-error", "./errors/async-effect-error/page.jsx"),
  route("errors/event-handler-error", "./errors/event-handler-error/page.jsx"),
  route("errors/hook-rule", "./errors/hook-rule/page.jsx"),
  route("errors/infinite-render-loop", "./errors/infinite-render-loop/page.jsx"),
  route("errors/json-parse-error", "./errors/json-parse-error/page.jsx"),
  route("errors/missing-component", "./errors/missing-component/page.jsx"),
  route("errors/null-access", "./errors/null-access/page.jsx"),
  route("errors/render-object", "./errors/render-object/page.jsx"),
  route("errors/type-error-not-function", "./errors/type-error-not-function/page.jsx"),
  route("errors/undefined-access", "./errors/undefined-access/page.jsx"),
  route("errors/unhandled-promise", "./errors/unhandled-promise/page.jsx"),
  route("privacy", "./privacy/page.jsx"),
  route("terms", "./terms/page.jsx"),
  route(":slug", "./[slug]/page.jsx"),
  route(":slug/dashboard", "./[slug]/dashboard/page.jsx"),
  route("__create/social-dev-shim", "./__create/social-dev-shim/page.jsx"),
  route("*?", "./__create/not-found.tsx")
];

export default routes;
