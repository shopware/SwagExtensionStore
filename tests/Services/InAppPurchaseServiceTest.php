<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use PHPUnit\Framework\TestCase;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseStruct;

class InAppPurchaseServiceTest extends TestCase
{
    public function testFilterValidInAppPurchases(): void
    {
        $service = new InAppPurchasesService($this->createMock(StoreClient::class));

        $collection = new InAppPurchaseCollection([
            InAppPurchaseStruct::fromArray(['identifier' => 'test-identifier-1', 'name' => 'Test Identifier 1', 'priceModel' => ['netPrice' => 1.0, 'grossPrice' => 1.0, 'taxRate' => 1.0, 'taxValue' => 1.0]]),
            InAppPurchaseStruct::fromArray(['identifier' => 'test-identifier-2', 'name' => 'Test Identifier 2', 'priceModel' => ['netPrice' => 1.0, 'grossPrice' => 1.0, 'taxRate' => 1.0, 'taxValue' => 1.0]]),
            InAppPurchaseStruct::fromArray(['identifier' => 'test-identifier-3', 'name' => 'Test Identifier 3', 'priceModel' => ['netPrice' => 1.0, 'grossPrice' => 1.0, 'taxRate' => 1.0, 'taxValue' => 1.0]]),
        ]);

        $result = $service->filterValidInAppPurchases(
            $collection,
            ['test-identifier-1', 'test-identifier-2', 'test-identifier-3'],
        );

        self::assertCount(3, $result);
        self::assertSame($collection, $result);

        $result = $service->filterValidInAppPurchases(
            $collection,
            ['test-identifier-1', 'test-identifier-2', 'test-identifier-3', 'test-identifier-4'],
        );

        self::assertCount(3, $result);
        self::assertSame($collection, $result);

        $result = $service->filterValidInAppPurchases(
            $collection,
            ['test-identifier-1', 'test-identifier-3'],
        );

        $collection->remove(1);

        self::assertCount(2, $result);
        self::assertSame($collection, $result);

        $result = $service->filterValidInAppPurchases(
            $collection,
            [],
        );

        self::assertCount(0, $result);
    }
}
