/**
 * Thin wrappers around the page reload, so consumers can be tested without stubbing `window.location`.
 * `reloadAfter` calls `reload` via the exported object on purpose, so tests can spy on it.
 */
export const pageReload = {
    reload(): void {
        window.location.reload();
    },

    async reloadAfter(milliseconds = 0): Promise<void> {
        await new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });

        pageReload.reload();
    }
};
