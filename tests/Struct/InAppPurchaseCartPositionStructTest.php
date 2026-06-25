<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Struct;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionStruct;

#[Package('checkout')]
class InAppPurchaseCartPositionStructTest extends TestCase
{
    public function testFromArrayWithSubscriptionChange(): void
    {
        $position = InAppPurchaseCartPositionStruct::fromArray([
            'extensionName' => 'testExtension',
            'inAppFeatureIdentifier' => 'feature_1',
            'netPrice' => 10.0,
            'grossPrice' => 12.0,
            'taxRate' => 20.0,
            'taxValue' => 2.0,
            'subscriptionChange' => [
                'currentFeature' => $this->getFeatureData('sub_feature'),
                'type' => 'upgrade',
                'currentFeatureVariant' => 'monthly',
                'currentNetPrice' => 8.0,
                'pendingDowngrade' => null,
                'isIncludedInPluginLicense' => false,
            ],
        ]);

        static::assertSame('testExtension', $position->getExtensionName());
        static::assertSame('feature_1', $position->getInAppFeatureIdentifier());
        static::assertSame(10.0, $position->getNetPrice());
        static::assertSame(12.0, $position->getGrossPrice());
        static::assertSame(20.0, $position->getTaxRate());
        static::assertSame(2.0, $position->getTaxValue());

        static::assertSame([
            'extensionName' => 'testExtension',
            'inAppFeatureIdentifier' => 'feature_1',
            'netPrice' => 10.0,
            'taxValue' => 2.0,
            'grossPrice' => 12.0,
            'taxRate' => 20.0,
            'variant' => '',
            'subscriptionChange' => [
                'type' => 'upgrade',
                'currentInAppFeatureIdentifier' => 'sub_feature',
            ],
        ], $position->toCart());
    }

    public function testFromArrayFallsBackToFeatureIdentifier(): void
    {
        $position = InAppPurchaseCartPositionStruct::fromArray([
            'extensionName' => 'testExtension',
            'inAppFeatureIdentifier' => '',
            'netPrice' => 0.0,
            'grossPrice' => 0.0,
            'taxRate' => 0.0,
            'taxValue' => 0.0,
            'feature' => ['identifier' => 'fallback_feature'],
        ]);

        static::assertSame('fallback_feature', $position->getInAppFeatureIdentifier());
    }

    public function testToCartWithoutSubscriptionChange(): void
    {
        $position = InAppPurchaseCartPositionStruct::fromArray([
            'extensionName' => 'testExtension',
            'inAppFeatureIdentifier' => 'feature_2',
            'netPrice' => 5.0,
            'grossPrice' => 6.0,
            'taxRate' => 20.0,
            'taxValue' => 1.0,
        ]);

        $cart = $position->toCart();

        static::assertArrayNotHasKey('subscriptionChange', $cart);
        static::assertSame('testExtension', $cart['extensionName']);
        static::assertSame('feature_2', $cart['inAppFeatureIdentifier']);
        static::assertSame(5.0, $cart['netPrice']);
        static::assertSame(1.0, $cart['taxValue']);
        static::assertSame(6.0, $cart['grossPrice']);
        static::assertSame(20.0, $cart['taxRate']);
        static::assertSame('', $cart['variant']);
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
