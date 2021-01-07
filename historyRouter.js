import { writable } from "svelte/store";
import { parse, stringify } from "./url";

/**
 * stack, get path and routes by store subscribe calling.
 */
export let historyStack;

let beforeHookHandler = () => true;

/**
 * store, pass reactive data to Route component.
 */
export const historyStore = writable({
    currentRoute: parse("/"),
    routes: [parse("/")]
})

historyStore.subscribe((val) => {
    historyStack = val;
});

/**
 * router hook before changing
 * 
 * @param {function} hook 
 */
export const onBeforeEnter = (hook) => {
    beforeHookHandler = hook;
}

/**
 * handle route jumping logic by calling hook, if step into next route or jump to redirect route, change promise to resolve. else if intercept router, change promise to reject.
 * 
 * @param {object} to 
 * @param {object} from 
 * @param {string} action 
 */
const callHook = (to, from, action) => {
    return new Promise((resolve, reject) => {
        let nextStatus = undefined;
        const next = (res = true) => nextStatus = res;
        beforeHookHandler(to, from, next, action);
        if (nextStatus === true) {
            resolve();
        } else if (nextStatus === false) {
            reject();
        } else if (
            typeof nextStatus === "string" || 
            typeof nextStatus === "object"
        ) {
            resolve(nextStatus);
        }
    });
}

/**
 * push forward a history route
 * 
 * @param {string | object} route 
 */
export const push = async (route) => {
    try {
        const url = stringify(route);
        const routeObj = parse(route);
        if (historyStack.currentRoute.url !== url) {
            const status = await callHook(routeObj, historyStack.currentRoute, "push");
            if (status !== undefined) {
                push(status);
            } else {
                window.history.pushState(null, "", url);
                historyStore.update((store) => {
                    store.currentRoute = routeObj;
                    store.routes.push(routeObj);
                    return store;
                });
            }
        }
    } catch (error) {
        if (error) {
            console.log("[router push error:]", error);
        }
    }
}

/**
 * replace current history route
 * 
 * @param {string | object} route 
 */
export const replace = async (route) => {
    try {
        const url = stringify(route);
        const routeObj = parse(route);
        if (historyStack.currentRoute.url !== url) {
            const status = await callHook(routeObj, historyStack.currentRoute, "replace");
            if (status !== undefined) {
                push(status);
            } else {
                window.history.replaceState(null, "", url);
                historyStore.update((store) => {
                    store.currentRoute = routeObj;
                    store.routes[0] = routeObj;
                    return store;
                });
            }
        }
    } catch (error) {
        if (error) {
            console.log("[router replace error:]", error);
        }
    }
}

/**
 * jump route
 * 
 * @param {number} step 
 */
export const go = async (step) => {
    try {
        const curretIndex = historyStack.routes.findIndex(item => item.url === historyStack.currentRoute.url);
        const stepRouteObj = historyStack.routes[curretIndex + step];
        if (step !== 0) {
            const status = await callHook(stepRouteObj, historyStack.currentRoute, "go");
            if (status !== undefined) {
                push(status);
            } else {
                window.history.go(step);
                historyStore.update((store) => {
                    store.currentRoute = stepRouteObj;
                    return store;
                });
            }
        }
    } catch (error) {
        if (error) {
            console.log("[router go error:]", error);
        }
    }
}

/**
 * step forward a route
 */
export const forward = async () => {
    try {
        const curretIndex = historyStack.routes.findIndex(item => item.url === historyStack.currentRoute.url);
        const forwardRouteObj = historyStack.routes[curretIndex + 1];
        const status = await callHook(forwardRouteObj, historyStack.currentRoute, "forward");
        if (status !== undefined) {
            push(status);
        } else {
            window.history.forward();
            historyStore.update((store) => {
                store.currentRoute = forwardRouteObj;
                return store;
            });
        }
    } catch (error) {
        if (error) {
            console.log("[router forward error:]", error);
        }
    }
}

/**
 * step back a route
 */
export const back = async () => {
    try {
        const curretIndex = historyStack.routes.findIndex(item => item.url === historyStack.currentRoute.url);
        const backRouteObj = historyStack.routes[curretIndex - 1];
        const status = await callHook(backRouteObj, historyStack.currentRoute, "back");
        if (status !== undefined) {
            push(status);
        } else {
            window.history.back();
            historyStore.update((store) => {
                store.currentRoute = backRouteObj;
                return store;
            });
        }
    } catch (error) {
        if (error) {
            console.log("[router go error:]", error);
        }
    }
}

window.onpopstate = async (e) => {
    try {
        const url = window.location.href.split(window.location.origin)[1];
        const routeObj = parse(url);
        const status = await callHook(routeObj, historyStack.currentRoute, "popstate");
        if (status !== undefined) {
            push(status);
        } else {
            historyStore.update((store) => {
                store.currentRoute = routeObj;
                return store;
            });
        }
    } catch (error) {
        if (error) {
            console.log("[router change error:]", error);
        } else {
            /**
             * avoid browser history stepping back or forward
             */
            const url = window.location.href.split(window.location.origin)[1];
            const routeObj = parse(url);
            const curretIndex = historyStack.routes.findIndex(item => item.url === historyStack.currentRoute.url);
            const routeIndex = historyStack.routes.findIndex(item => item.url === routeObj.url);
            const isBackForward = routeIndex < curretIndex;
            const isNextForward = routeIndex > curretIndex;
            if (isBackForward) {
                window.history.forward();
            } else if (isNextForward) {
                window.history.back();
            }
        }
    }
}
