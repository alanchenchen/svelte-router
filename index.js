import BrowserRouterComponent from "./BrowserRouter.svelte";
import RouteComponent from "./Route.svelte";
import LinkComponent from "./Link.svelte";
import * as router from "./historyRouter";

export const BrowserRouter = BrowserRouterComponent;
export const Route = RouteComponent;
export const Link = LinkComponent;
export const historyRouter = router;