<script>
    import { push as pushState, replace as replaceState } from "./historyRouter";

    export let replace = false;
    export let to = undefined;

    const handler = () => {
        if (to) {
            if (replace) {
                replaceState(to);
            } else {
                pushState(to);
            }
        }
    };
</script>

<a href="javascipt:void" on:click={handler}>
    <slot />
</a>