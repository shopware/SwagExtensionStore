import { shallowMount } from '@vue/test-utils';
Shopware.Component.register('sw-admin', () => import('src/app/component/structure/sw-admin'));

Shopware.Component.override('sw-admin', () => import('./index'));

describe('global extension checkout modal', () => {
    const originalBroadcastChannel = global.BroadcastChannel;

    beforeEach(() => {
        global.BroadcastChannel = jest.fn(() => ({ close: jest.fn() })) as never;
    });

    afterEach(() => {
        global.BroadcastChannel = originalBroadcastChannel;
    });

    it.each([true, false])('mounts a single modal only for a logged-in session (%s)', async (isLoggedIn) => {
        const wrapper = shallowMount(await Shopware.Component.build('sw-admin'), {
            global: {
                stubs: {
                    'sw-extension-store-purchase-confirmation-modal': true,
                    'router-view': true,
                },
                provide: {
                    loginService: { isLoggedIn: () => isLoggedIn },
                    userActivityService: { updateLastUserActivity: jest.fn() },
                    feature: {},
                },
            },
        });

        expect(wrapper.findAll('sw-extension-store-purchase-confirmation-modal-stub')).toHaveLength(isLoggedIn ? 1 : 0);
        expect(wrapper.find('#app').exists()).toBe(true);
        wrapper.unmount();
    });
});
