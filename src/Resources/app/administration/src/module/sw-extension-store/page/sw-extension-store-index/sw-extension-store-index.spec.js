import { mount } from '@vue/test-utils';
import 'src/app/component/meteor/sw-meteor-page';

const mockRouter = { afterEach: jest.fn(), push: jest.fn() };

const mockStore = {
    iframeUrl: null,
};

jest.mock('SwagExtensionStore/module/sw-extension-store/store/extension-store-context.store', () => jest.fn(() => mockStore));
jest.mock('SwagExtensionStore/util/telemetry', () => ({ trackExtensionStoreEvent: jest.fn() }));

Shopware.Component.register(
    'sw-extension-store-index',
    () => import('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index'),
);

async function createWrapper(channelService = null, iframeStub = true) {
    if (channelService === null) {
        channelService = {
            register: jest.fn(),
            unregister: jest.fn(),
        };
    }

    return mount(await Shopware.Component.build('sw-extension-store-index'), {
        props: {},
        global: {
            renderStubDefaultSlot: true,
            mocks: {
                $router: mockRouter,
                $route: Shopware.Vue.reactive({
                    name: 'sw.extension.store.listing.app',
                    meta: {
                        $module: {},
                    },
                }),
            },
            stubs: {
                'sw-iframe-renderer': iframeStub,
                'sw-extension-store-purchase-confirmation-modal': true,
            },
            provide: {
                extensionStoreChannelService: channelService,
            },
        },
    });
}

describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index', () => {
    afterEach(() => {
        mockStore.iframeUrl = null;
    });

    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
    });

    it('should use the register service method', async () => {
        const channelService = {
            register: jest.fn(),
            unregister: jest.fn(),
        };
        await createWrapper(channelService);

        expect(channelService.register).toHaveBeenCalledWith(expect.any(Function), mockRouter);
    });

    it('should unregister the channel service on unmount', async () => {
        const channelService = {
            register: jest.fn(),
            unregister: jest.fn(),
        };
        const wrapper = await createWrapper(channelService);

        await wrapper.unmount();

        expect(channelService.unregister).toBeCalled();
    });

    it('should not render the iframe while the store URL is loading', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.find('sw-iframe-renderer-stub').exists()).toBe(false);
    });

    it('binds the channel to its own iframe', async () => {
        mockStore.iframeUrl = 'https://iframe.shopware.com';
        const service = { register: jest.fn(), unregister: jest.fn() };
        const wrapper = await createWrapper(service, { template: '<div><iframe /></div>' });
        const iframe = wrapper.find('iframe');
        const getFrame = service.register.mock.calls[0][0];
        expect(getFrame()).toBe(iframe.element);
        wrapper.unmount();
        expect(service.unregister).toHaveBeenCalledTimes(1);
    });

    it('should render the iframe once the store URL is available', async () => {
        mockStore.iframeUrl = 'https://iframe.shopware.com';

        const wrapper = await createWrapper();

        expect(wrapper.find('sw-iframe-renderer-stub').exists()).toBe(true);
        expect(wrapper.find('sw-iframe-renderer-stub').attributes('src')).toBe('https://iframe.shopware.com');
    });
});
