import { mount } from '@vue/test-utils';

Shopware.Component.register(
    'sw-extension-store-label-display',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-label-display')
);
Shopware.Component.register(
    'sw-extension-label',
    () => import('SwagExtensionStore/module/sw-extension-store/component/sw-extension-store-label')
);


async function createWrapper(labels) {
    return mount(await Shopware.Component.build('sw-extension-store-label-display'), {
        props: {
            labels
        },
        global: {
            stubs: {
                'sw-extension-label': await Shopware.Component.build('sw-extension-label')
            }
        }
    });
}

describe('sw-extension-store-label-display', () => {
    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper([{
            label: 'Gold zerifiziert',
            color: '#cbac44'
        }]);

        expect(wrapper.vm).toBeTruthy();
    });

    it('should display the labels with the correct background', async () => {
        const wrapper = await createWrapper([{
            label: 'Label Text 0',
            color: '#cbac44'
        },
        {
            label: 'Label Text 1'
        },
        {
            label: 'Label Text 2',
            color: '#000'
        }]);

        const label = wrapper.findAll('.sw-extension-label');

        expect(label.at(0).attributes().style).toBe('background-color: rgb(203, 172, 68); color: rgb(255, 255, 255);');
        expect(label.at(0).text()).toBe('Label Text 0');

        expect(label.at(1).attributes().style).toBe('background-color: rgba(41, 51, 61, 0.749); color: rgb(255, 255, 255);');
        expect(label.at(1).text()).toBe('Label Text 1');

        expect(label.at(2).attributes().style).toBe('background-color: rgb(0, 0, 0); color: rgb(255, 255, 255);');
        expect(label.at(2).text()).toBe('Label Text 2');
    });
});
