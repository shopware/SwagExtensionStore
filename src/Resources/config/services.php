<?php

declare(strict_types=1);

use Shopware\Core\Framework\App\InAppPurchases\Gateway\InAppPurchasesGateway;
use Shopware\Core\Framework\Store\Authentication\StoreRequestOptionsProvider;
use Shopware\Core\Framework\Store\InAppPurchase\Services\InAppPurchaseUpdater;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use SwagExtensionStore\Controller\InAppPurchasesController;
use SwagExtensionStore\Controller\LicenseController;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Services\LicenseService;
use SwagExtensionStore\Services\StoreClient;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

return static function (ContainerConfigurator $container): void {
    $container->parameters()->set('swag_extension_store.endpoints', [
        'create_basket' => '/swplatform/extensionstore/baskets',
        'order_basket' => '/swplatform/extensionstore/orders',
        'payment_means' => '/swplatform/extensionstore/paymentmeans',
        'iap_create_basket' => '/swplatform/inappfeatures/baskets',
        'iap_order_basket' => '/swplatform/inappfeatures/orders',
        'iap_list' => '/swplatform/extensionstore/extensions/%s/inappfeatures',
        'iap_details' => '/swplatform/extensionstore/extensions/%%s/inappfeatures/%%s',
    ]);

    $services = $container->services();

    $services->set(LicenseController::class)
        ->public()
        ->args([service(LicenseService::class)]);

    $services->set(InAppPurchasesController::class)
        ->public()
        ->args([
            service(InAppPurchasesService::class),
            service(InAppPurchaseUpdater::class),
            service(AbstractExtensionDataProvider::class),
            service(InAppPurchasesGateway::class),
            service('app.repository'),
        ]);

    $services->set(LicenseService::class)
        ->args([service(StoreClient::class)]);

    $services->set(StoreClient::class)
        ->args([
            '%swag_extension_store.endpoints%',
            service(StoreRequestOptionsProvider::class),
            service('shopware.store_client'),
        ]);

    $services->set(InAppPurchasesService::class)
        ->args([service(StoreClient::class)]);
};
