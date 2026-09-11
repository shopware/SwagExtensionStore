<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Struct;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseStatus;
use SwagExtensionStore\Struct\InAppPurchaseStruct;

#[Package('checkout')]
class InAppPurchaseStructTest extends TestCase
{
    public function testFromArrayMapsStatusAndPriceModels(): void
    {
        $purchase = InAppPurchaseStruct::fromArray([
            'identifier' => 'feature_1',
            'name' => 'Feature 1',
            'description' => 'Description 1',
            'serviceConditions' => 'Conditions',
            'websiteGtc' => 'https://example.com/gtc',
            'preselectedVariant' => 'monthly',
            'priceModels' => [[
                'variant' => 'monthly',
                'type' => 'rent',
                'price' => 10.0,
                'duration' => 12,
                'oneTimeOnly' => false,
                'conditionsType' => null,
            ]],
            'status' => 'active',
        ]);

        static::assertSame('feature_1', $purchase->getIdentifier());
        static::assertSame(InAppPurchaseStatus::ACTIVE, $purchase->getStatus());
        static::assertCount(1, $purchase->getPriceModels());
        static::assertSame('monthly', $purchase->getPriceModels()->first()?->getVariant());
    }

    public function testFromArrayDefaultsStatusToInactive(): void
    {
        $purchase = InAppPurchaseStruct::fromArray([
            'identifier' => 'feature_2',
            'name' => 'Feature 2',
            'description' => null,
            'priceModels' => [[
                'variant' => 'yearly',
                'type' => 'rent',
                'price' => 59.5,
                'duration' => 12,
                'oneTimeOnly' => false,
                'conditionsType' => null,
            ]],
        ]);

        static::assertSame(InAppPurchaseStatus::INACTIVE, $purchase->getStatus());
    }
}
