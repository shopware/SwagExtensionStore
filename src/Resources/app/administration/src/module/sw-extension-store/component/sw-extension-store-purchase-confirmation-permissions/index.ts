import template from './sw-extension-store-purchase-confirmation-permissions.html.twig';
import './sw-extension-store-purchase-confirmation-permissions.scss';

import type { ExtensionStoreBasket } from '../../types/extension-store-basket.types';

/**
 * @private
 */
export default Shopware.Component.wrapComponentConfig({
    template,

    props: {
        cart: {
            type: Object as PropType<ExtensionStoreBasket>,
            required: true
        }
    },

    emits: [
        'update:modal-view'
    ],

    computed: {
        position() {
            return this.cart?.positions?.[0];
        },

        extension() {
            return this.position?.extension;
        },

        operations() {
            return [
                {
                    label: this.$tc('sw-extension-store.component.sw-extension-permissions-details-modal.operationRead'),
                    operation: 'read'
                },
                {
                    label: this.$tc('sw-extension-store.component.sw-extension-permissions-details-modal.operationUpdate'),
                    operation: 'update'
                },
                {
                    label: this.$tc('sw-extension-store.component.sw-extension-permissions-details-modal.operationCreate'),
                    operation: 'create'
                },
                {
                    label: this.$tc('sw-extension-store.component.sw-extension-permissions-details-modal.operationDelete'),
                    operation: 'delete'
                }
            ];
        },

        permissions() {
            const extensionPermissions = this.extension.permissions;
            if (!extensionPermissions || Object.keys(extensionPermissions).length === 0) {
                return null;
            }

            return Object.fromEntries(
                Object.entries(this.extension.permissions).map(
                    ([
                        category,
                        permissions
                    ]) => {
                        const grouped = permissions.reduce<Record<string, string[]>>((acc, permission) => {
                            const entity = permission.entity;

                            if (entity === 'additional_privileges') {
                                acc[permission.operation] = [];

                                return acc;
                            }

                            acc[entity] = (acc[entity] || []).concat(permission.operation);

                            return acc;
                        }, {});
                        return [
                            category,
                            grouped
                        ];
                    }
                )
            );
        },

        domains() {
            return this.extension.domains.filter((domain) => domain !== null);
        }
    },

    methods: {
        categoryLabel(category: string) {
            const translation = `entityCategories.${category}.title`;

            return this.$te(translation) ? this.$tc(translation) : category;
        },

        entityLabel(category: string, entity: string) {
            const translation = `entityCategories.${category}.entities.${entity}`;

            return this.$te(translation) ? this.$tc(translation) : entity;
        },

        showCheckout() {
            this.$emit('update:modal-view', 'checkout');
        }
    }
});
