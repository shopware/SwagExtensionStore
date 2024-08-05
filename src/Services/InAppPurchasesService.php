<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;

#[Package('checkout')]
class InAppPurchasesService
{
    private StoreClient $client;

    public function __construct(StoreClient $client)
    {
        $this->client = $client;
    }

    public function createCart(string $extensionName, string $feature, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->createInAppPurchaseCart($extensionName, $feature, $context);
    }

    public function orderCart(string $extensionName, string $feature, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->orderInAppPurchaseCart($extensionName, $feature, $context);
    }
}