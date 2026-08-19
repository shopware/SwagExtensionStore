import { pageReload } from 'SwagExtensionStore/util/page-reload';

describe('SwagExtensionStore/util/page-reload', () => {
    let reloadSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        reloadSpy = jest.spyOn(pageReload, 'reload').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('should not reload the page before the given delay has passed', async () => {
        const reloaded = pageReload.reloadAfter(1_500);

        jest.advanceTimersByTime(1_499);
        await Promise.resolve();

        expect(reloadSpy).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await reloaded;
    });

    it('should reload the page after the given delay', async () => {
        const reloaded = pageReload.reloadAfter(1_500);

        jest.advanceTimersByTime(1_500);
        await reloaded;

        expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('should reload the page without an explicit delay', async () => {
        const reloaded = pageReload.reloadAfter();

        jest.advanceTimersByTime(0);
        await reloaded;

        expect(reloadSpy).toHaveBeenCalledTimes(1);
    });
});
