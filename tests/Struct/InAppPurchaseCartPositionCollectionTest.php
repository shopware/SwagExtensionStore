<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Struct;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionCollection;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionStruct;

#[Package('checkout')]
class InAppPurchaseCartPositionCollectionTest extends TestCase
{
    public function testFromArrayCreatesCollectionCorrectly(): void
    {
        $collection = $this->getAppPurchaseCartPositionCollection();

        self::assertCount(2, $collection);
    }

    public function testToCartReturnsCorrectCartArray(): void
    {
        $collection = $this->getAppPurchaseCartPositionCollection();

        $cart = $collection->toCart();

        self::assertCount(2, $cart);
        self::assertSame('feature_1', $cart[0]['inAppFeatureIdentifier']);
        self::assertSame('feature_2', $cart[1]['inAppFeatureIdentifier']);
    }

    public function testGetIdentifiersReturnsCorrectIdentifiers(): void
    {
        self::assertSame(['feature_1', 'feature_2'], $this->getAppPurchaseCartPositionCollection()->getIdentifiers());
    }

    public function testFilterValidInAppPurchasesReturnsValidPurchases(): void
    {
        $allPurchases = $this->getAppPurchaseCartPositionCollection();

        $validPurchases = ['feature_1'];

        $filteredCollection = $allPurchases->filterValidInAppPurchases($allPurchases, $validPurchases);

        self::assertCount(1, $filteredCollection);
        $first = $filteredCollection->first();
        self::assertInstanceOf(InAppPurchaseCartPositionStruct::class, $first);
        self::assertSame('feature_1', $first->getInAppFeatureIdentifier());
    }

    public function getAppPurchaseCartPositionCollection(): InAppPurchaseCartPositionCollection
    {
        $data = [
            ['inAppFeatureIdentifier' => 'feature_1', 'netPrice' => 10.0, 'grossPrice' => 12.0, 'taxRate' => 20.0, 'taxValue' => 2.0],
            ['inAppFeatureIdentifier' => 'feature_2', 'netPrice' => 20.0, 'grossPrice' => 24.0, 'taxRate' => 20.0, 'taxValue' => 4.0],
        ];

        return InAppPurchaseCartPositionCollection::fromArray($data);
    }
}
