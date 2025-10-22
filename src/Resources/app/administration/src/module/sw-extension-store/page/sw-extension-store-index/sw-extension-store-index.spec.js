import { mount } from '@vue/test-utils';
import 'src/app/component/meteor/sw-meteor-page';

Shopware.Component.register(
    'sw-extension-store-index',
    () => import('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index'),
);

async function createWrapper(channelService = null) {
    if (channelService === null) {
        channelService = {
            register: jest.fn(),
        };
    }
    return mount(await Shopware.Component.build('sw-extension-store-index'), {
        props: {},
        global: {
            renderStubDefaultSlot: true,
            mocks: {
                $route: Shopware.Vue.reactive({
                    name: 'sw.extension.store.listing.app',
                    meta: {
                        $module: {},
                    },
                }),
            },
            stubs: {
                'sw-iframe-renderer': true,
            },
            provide: {
                extensionStoreChannelService: channelService,
            },
        },
    });
}

describe('SwagExtensionStore/module/sw-extension-store/page/sw-extension-store-index', () => {
    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
    });

    it('should use the register service method', async () => {
        const channelService = {
            register: jest.fn(),
        };
        await createWrapper(channelService);

        expect(channelService.register).toBeCalled();
    });
});
