<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionCollection;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
use SwagExtensionStore\Struct\InAppPurchaseCollection;

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

    public function orderCart(float $taxRate, InAppPurchaseCartPositionCollection $positions, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->orderInAppPurchaseCart($taxRate, $positions, $context);
    }

    public function listPurchases(string $extensionName, Context $context): InAppPurchaseCollection
    {
        return $this->client->listInAppPurchases($extensionName, $context);
    }
}
