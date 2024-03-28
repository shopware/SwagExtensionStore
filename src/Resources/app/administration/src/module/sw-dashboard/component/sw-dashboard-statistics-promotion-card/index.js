import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

export default Shopware.Component.wrapComponentConfig({
    template,

    i18n: {
        messages: {
            'en-GB': {
                title: 'Begin your journey to data driven success',
                'promotion-text': 'Ready, set, analyze! Get access to powerful tools to understand customer behavior and enhance your shop\'s performance. Don\'t wait — start collecting essential data now to be ahead of the game.',
                cta: 'Get started with analytics'
            }
        }
    }
});
