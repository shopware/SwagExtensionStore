<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionStruct;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseStatus;
use SwagExtensionStore\Struct\InAppPurchaseStruct;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @phpstan-import-type InAppPurchaseCartPosition from InAppPurchaseCartPositionStruct
 */
#[Package('checkout')]
class InAppPurchasesService
{
    public function __construct(
        private readonly StoreClient $client,
    ) {
    }

    public function createCart(string $extensionName, string $feature, string $variant, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->createInAppPurchaseCart($extensionName, $feature, $variant, $context);
    }

    /**
     * @param array<int, InAppPurchaseCartPosition> $positions
     */
    public function orderCart(float $taxRate, array $positions, Context $context): JsonResponse
    {
        return $this->client->orderInAppPurchaseCart($taxRate, $positions, $context);
    }

    public function listPurchases(string $extensionName, Context $context): InAppPurchaseCollection
    {
        $purchases = $this->client->listInAppPurchases($extensionName, $context);

        return $purchases->filter(fn (InAppPurchaseStruct $purchase) => $purchase->getStatus() === InAppPurchaseStatus::ACTIVE);
    }
}
