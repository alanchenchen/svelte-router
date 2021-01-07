<script>
    import { getContext } from "svelte";
    import { parseDynamicRoute } from "./url.js";
    export let component = undefined;
    export let path = undefined;
    
    const historyStore = getContext("historyStore");
    let isFitCurrentPath = false;
    /**
     * current router view route info.
     */
    let route = undefined;
    $: {
        const paramPareseResult = parseDynamicRoute($historyStore.currentRoute.path, path);
        if (paramPareseResult !== false) {
            isFitCurrentPath = true;
            route = {
                ...$historyStore.currentRoute,
                params: paramPareseResult
            }
        } else {
            isFitCurrentPath = false;
        }
    }
</script>
{#if isFitCurrentPath}
    <svelte:component this={component} {route} />
{:else}
    <!-- else content here -->
{/if}