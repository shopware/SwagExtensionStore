/**
 * @deprecated tag:v6.8.0 - `translation.init.ts` will be removed to use automatic language loading with language layer support
 */
import deDashboardSnippets from '../module/sw-dashboard/snippet/de.json';
import enDashboardSnippets from '../module/sw-dashboard/snippet/en.json';

import deExtensionSnippets from '../module/sw-extension/snippet/de.json';
import enExtensionSnippets from '../module/sw-extension/snippet/en.json';

import deExtensionStoreSnippets from '../module/sw-extension-store/snippet/de.json';
import enExtensionStoreSnippets from '../module/sw-extension-store/snippet/en.json';

import deInAppPurchasesSnippets from '../module/sw-in-app-purchases/snippet/de.json';
import enInAppPurchasesSnippets from '../module/sw-in-app-purchases/snippet/en.json';

Shopware.Locale.extend('de-DE', deDashboardSnippets);
Shopware.Locale.extend('en-GB', enDashboardSnippets);

Shopware.Locale.extend('de-DE', deExtensionSnippets);
Shopware.Locale.extend('en-GB', enExtensionSnippets);

Shopware.Locale.extend('de-DE', deExtensionStoreSnippets);
Shopware.Locale.extend('en-GB', enExtensionStoreSnippets);

Shopware.Locale.extend('de-DE', deInAppPurchasesSnippets);
Shopware.Locale.extend('en-GB', enInAppPurchasesSnippets);
