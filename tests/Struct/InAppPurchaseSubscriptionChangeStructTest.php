<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Struct;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchasePendingDowngradeStruct;
use SwagExtensionStore\Struct\InAppPurchaseSubscriptionChangeStruct;

#[Package('checkout')]
class InAppPurchaseSubscriptionChangeStructTest extends TestCase
{
    public function testFromArrayWithoutPendingDowngrade(): void
    {
        $subscriptionChange = InAppPurchaseSubscriptionChangeStruct::fromArray([
            'currentFeature' => $this->getFeatureData('current_feature'),
            'type' => 'upgrade',
            'currentFeatureVariant' => 'monthly',
            'currentNetPrice' => 10.0,
            'pendingDowngrade' => null,
            'isIncludedInPluginLicense' => false,
        ]);

        static::assertSame('upgrade', $subscriptionChange->getType());
        static::assertSame('monthly', $subscriptionChange->getCurrentFeatureVariant());
        static::assertSame(10.0, $subscriptionChange->getCurrentNetPrice());
        static::assertFalse($subscriptionChange->isIncludedInPluginLicense());
        static::assertSame('current_feature', $subscriptionChange->getCurrentFeature()->getIdentifier());
        static::assertNull($subscriptionChange->getPendingDowngrade());
    }

    public function testFromArrayWithPendingDowngrade(): void
    {
        $subscriptionChange = InAppPurchaseSubscriptionChangeStruct::fromArray([
            'currentFeature' => $this->getFeatureData('current_feature'),
            'type' => 'downgrade',
            'currentFeatureVariant' => 'yearly',
            'currentNetPrice' => 20.0,
            'pendingDowngrade' => [
                'feature' => $this->getFeatureData('downgrade_feature'),
                'netPrice' => 5.0,
            ],
            'isIncludedInPluginLicense' => true,
        ]);

        static::assertTrue($subscriptionChange->isIncludedInPluginLicense());

        $pendingDowngrade = $subscriptionChange->getPendingDowngrade();
        static::assertInstanceOf(InAppPurchasePendingDowngradeStruct::class, $pendingDowngrade);
        static::assertSame('downgrade_feature', $pendingDowngrade->getFeature()->getIdentifier());
        static::assertSame(5.0, $pendingDowngrade->getNetPrice());
    }

    public function testToCartReturnsTypeAndCurrentFeatureIdentifier(): void
    {
        $subscriptionChange = InAppPurchaseSubscriptionChangeStruct::fromArray([
            'currentFeature' => $this->getFeatureData('current_feature'),
            'type' => 'upgrade',
            'currentFeatureVariant' => 'monthly',
            'currentNetPrice' => 10.0,
            'pendingDowngrade' => null,
            'isIncludedInPluginLicense' => false,
        ]);

        static::assertSame([
            'type' => 'upgrade',
            'currentInAppFeatureIdentifier' => 'current_feature',
        ], $subscriptionChange->toCart());
    }

    /**
     * @return array{identifier: string, name: string, description: string|null, priceModels: array<int, array{variant: string, type: string, price: float, duration: int|null, oneTimeOnly: bool|null, conditionsType: string|null}>}
     */
    private function getFeatureData(string $identifier): array
    {
        return [
            'identifier' => $identifier,
            'name' => 'Feature',
            'description' => 'Description',
            'priceModels' => [[
                'variant' => 'monthly',
                'type' => 'rent',
                'price' => 10.0,
                'duration' => 12,
                'oneTimeOnly' => false,
                'conditionsType' => null,
            ]],
        ];
    }
}
