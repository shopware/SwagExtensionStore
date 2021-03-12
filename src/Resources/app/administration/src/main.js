import './module/sw-extension-store';
import './extensions/component/sw-admin';
import './extensions/component/sw-license-violation';
import LicenseViolationsService from './extensions/service/license-violations.service';
import LicenseViolationStore from './extensions/state/license-violation.store';

Shopware.Application.addServiceProvider('licenseViolationService', () => {
    return LicenseViolationsService(Shopware.Application.getContainer('service').storeService);
});

Shopware.State.registerModule('licenseViolation', LicenseViolationStore);
