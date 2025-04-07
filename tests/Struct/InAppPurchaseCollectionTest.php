<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Struct;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseStruct;

#[Package('checkout')]
class InAppPurchaseCollectionTest extends TestCase
{
    public function testFromArray(): void
    {
        $collection = $this->getInAppPurchaseCollection();

        static::assertCount(2, $collection);
    }

    public function testGetIdentifiers(): void
    {
        $identifiers = $this->getInAppPurchaseCollection()->getIdentifiers();

        static::assertSame(['purchase_1', 'purchase_2'], $identifiers);
    }

    public function testFilterValidInAppPurchases(): void
    {
        $allPurchases = $this->getInAppPurchaseCollection();

        $validPurchases = ['purchase_1'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        static::assertCount(1, $filteredCollection);
        $first = $filteredCollection->first();
        static::assertInstanceOf(InAppPurchaseStruct::class, $first);
        static::assertSame('purchase_1', $first->getIdentifier());

        $validPurchases = ['non_existent_purchase'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        static::assertCount(0, $filteredCollection);

        $validPurchases = ['purchase_1', 'purchase_2'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        static::assertCount(2, $filteredCollection);
        $first = $filteredCollection->first();
        static::assertInstanceOf(InAppPurchaseStruct::class, $first);
        static::assertSame('purchase_1', $first->getIdentifier());
        $last = $filteredCollection->last();
        static::assertInstanceOf(InAppPurchaseStruct::class, $last);
        static::assertSame('purchase_2', $last->getIdentifier());

        $validPurchases = ['purchase_1', 'purchase_2', 'purchase_3'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        static::assertCount(2, $filteredCollection);
        $first = $filteredCollection->first();
        static::assertInstanceOf(InAppPurchaseStruct::class, $first);
        static::assertSame('purchase_1', $first->getIdentifier());
        $last = $filteredCollection->last();
        static::assertInstanceOf(InAppPurchaseStruct::class, $last);
        static::assertSame('purchase_2', $last->getIdentifier());
    }

    public function getInAppPurchaseCollection(): InAppPurchaseCollection
    {
        $data = [
            [
                'id' => 1,
                'identifier' => 'purchase_1',
                'name' => 'Feature 1',
                'description' => 'Description 1',
                'serviceConditions' => null,
                'websiteGtc' => null,
                'priceModels' => [[
                    'variant' => 'monthly',
                    'type' => 'rent',
                    'price' => 10.0,
                    'duration' => 12,
                    'oneTimeOnly' => false,
                    'conditionsType' => null,
                ]],
            ],
            [
                'id' => 2,
                'identifier' => 'purchase_2',
                'name' => 'Feature 2',
                'description' => 'Description 2',
                'serviceConditions' => null,
                'websiteGtc' => null,
                'priceModels' => [[
                    'variant' => 'non-consumable',
                    'type' => 'buy',
                    'price' => 100.0,
                    'duration' => null,
                    'oneTimeOnly' => false,
                    'conditionsType' => null,
                ]],
            ],
        ];

        return InAppPurchaseCollection::fromArray($data);
    }
}
