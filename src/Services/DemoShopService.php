<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Authentication\StoreRequestOptionsProvider;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use SwagExtensionStore\Struct\DemoShopInformationStruct;

#[Package('checkout')]
class DemoShopService
{
    public function __construct(
        private readonly StoreClient $client,
        private readonly SystemConfigService $systemConfigService,
    ) {
    }

    public function getDemoShopInformation(Context $context): ?DemoShopInformationStruct
    {
        // A demo shop is always provisioned with SBP credentials, so without
        // a shop secret this installation cannot be a demo shop.
        if ($this->systemConfigService->getString(StoreRequestOptionsProvider::CONFIG_KEY_STORE_SHOP_SECRET) === '') {
            return null;
        }

        return $this->client->getDemoShopInformation($context);
    }
}
