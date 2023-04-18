import { shallowMount } from '@vue/test-utils';
import SwExtensionIconFallback from 'SwagExtensionStore/module/sw-extension-store/component/sw-extension-icon-polyfill';

Shopware.Component.register('sw-extension-icon-polyfill', SwExtensionIconFallback);

async function createWrapper() {
    return shallowMount(await Shopware.Component.build('sw-extension-icon-polyfill'), {
        propsData: {
            src: 'path/to/image',
            alt: 'image description'
        },
        stubs: {
            'sw-extension-icon': true
        }
    });
}

describe('src/module/sw-extension-store/component/sw-extension-icon-polyfill', () => {
    it('uses core component if exists', async () => {
        jest.spyOn(Shopware.Component.getComponentRegistry(), 'has')
            .mockImplementationOnce((key) => {
                return key === 'sw-extension-icon';
            });

        const wrapper = await createWrapper();

        expect(wrapper.get('sw-extension-icon-stub').attributes('src')).toBe('path/to/image');
        expect(wrapper.get('sw-extension-icon-stub').attributes('alt')).toBe('image description');

        expect(wrapper.find('.sw-extension-icon-polyfill__root').exists()).toBe(false);
    });

    it('uses image if core component does not exist', async () => {
        jest.spyOn(Shopware.Component.getComponentRegistry(), 'has')
            .mockImplementationOnce((key) => {
                return !(key === 'sw-extension-icon');
            });

        const wrapper = await createWrapper();

        expect(wrapper.find('sw-extension-icon-stub').exists()).toBe(false);

        const iconRoot = wrapper.get('.sw-extension-icon-polyfill__root');

        expect(iconRoot.get('.sw-extension-icon-polyfill__icon').attributes('src')).toBe('path/to/image');
        expect(iconRoot.get('.sw-extension-icon-polyfill__icon').attributes('alt')).toBe('image description');
    });
});
