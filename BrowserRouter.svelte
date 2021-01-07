<script>
    import { setContext } from "svelte"; 
    import { historyStore } from "./historyRouter";

    setContext("historyStore", historyStore);
</script>

<slot />