<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Collection;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseIdentifiableStruct;

#[Package('checkout')]
class InAppPurchasesService
{
    public function __construct(
        private StoreClient $client,
    ) {}

    public function createCart(string $extensionName, string $feature, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->createInAppPurchaseCart($extensionName, $feature, $context);
    }

    /**
     * @param array<int, array{inAppFeatureIdentifier: string, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}> $positions
     */
    public function orderCart(float $taxRate, array $positions, Context $context): InAppPurchaseCartStruct
    {
        return $this->client->orderInAppPurchaseCart($taxRate, $positions, $context);
    }

    public function listPurchases(string $extensionName, Context $context): InAppPurchaseCollection
    {
        return $this->client->listInAppPurchases($extensionName, $context);
    }

    /**
     * @param Collection<InAppPurchaseIdentifiableStruct> $allPurchases
     * @param array<int, string> $validPurchases
     *
     * @return Collection<InAppPurchaseIdentifiableStruct>
     */
    public function filterValidInAppPurchases(
        Collection $allPurchases,
        array $validPurchases,
    ): Collection {
        if (empty($validPurchases)) {
            $allPurchases->clear();

            return $allPurchases;
        }

        foreach ($allPurchases as $key => $purchase) {
            if (\in_array($purchase->getIdentifier(), $validPurchases)) {
                continue;
            }

            $allPurchases->remove($key);
        }

        return $allPurchases;
    }
}
