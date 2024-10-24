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

        self::assertCount(2, $collection);
    }

    public function testGetIdentifiers(): void
    {
        $collection = $this->getInAppPurchaseCollection();

        $identifiers = $collection->getIdentifiers();

        self::assertSame(['purchase_1', 'purchase_2'], $identifiers);
    }

    public function testFilterValidInAppPurchases(): void
    {
        $allPurchases = $this->getInAppPurchaseCollection();

        $validPurchases = ['purchase_1'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        self::assertCount(1, $filteredCollection);
        $first = $filteredCollection->first();
        self::assertInstanceOf(InAppPurchaseStruct::class, $first);
        self::assertSame('purchase_1', $first->getIdentifier());

        $validPurchases = ['non_existent_purchase'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        self::assertCount(0, $filteredCollection);

        $validPurchases = ['purchase_1', 'purchase_2'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        self::assertCount(2, $filteredCollection);
        $first = $filteredCollection->first();
        self::assertInstanceOf(InAppPurchaseStruct::class, $first);
        self::assertSame('purchase_1', $first->getIdentifier());
        $last = $filteredCollection->last();
        self::assertInstanceOf(InAppPurchaseStruct::class, $last);
        self::assertSame('purchase_2', $last->getIdentifier());

        $validPurchases = ['purchase_1', 'purchase_2', 'purchase_3'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        self::assertCount(2, $filteredCollection);
        $first = $filteredCollection->first();
        self::assertInstanceOf(InAppPurchaseStruct::class, $first);
        self::assertSame('purchase_1', $first->getIdentifier());
        $last = $filteredCollection->last();
        self::assertInstanceOf(InAppPurchaseStruct::class, $last);
        self::assertSame('purchase_2', $last->getIdentifier());
    }

    public function getInAppPurchaseCollection(): InAppPurchaseCollection
    {
        $data = [
            [
                'identifier' => 'purchase_1',
                'name' => 'Feature 1',
                'description' => 'Description 1',
                'priceModel' => [
                    'type' => 'subscription',
                    'price' => 10.0,
                    'duration' => '1 month',
                    'oneTimeOnly' => false,
                ],
            ],
            [
                'identifier' => 'purchase_2',
                'name' => 'Feature 2',
                'description' => 'Description 2',
                'priceModel' => [
                    'type' => 'one-time',
                    'price' => 100.0,
                    'duration' => null,
                    'oneTimeOnly' => true,
                ],
            ],
        ];

        return InAppPurchaseCollection::fromArray($data);
    }
}
