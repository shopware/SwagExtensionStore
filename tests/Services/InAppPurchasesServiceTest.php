<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseStatus;
use SwagExtensionStore\Struct\InAppPurchaseStruct;

class InAppPurchasesServiceTest extends TestCase
{
    public function testListPurchases(): void
    {
        $context = Context::createDefaultContext();

        $storeClientMock = $this->createMock(StoreClient::class);
        $storeClientMock->method('listInAppPurchases')
            ->with('testExtension', $context)
            ->willReturn($this->getAllPurchases());

        $response = (new InAppPurchasesService($storeClientMock))
            ->listPurchases('testExtension', $context);

        static::assertCount(2, $response);

        $firstPurchase = $response->first();
        static::assertInstanceOf(InAppPurchaseStruct::class, $firstPurchase);
        static::assertSame($firstPurchase->getStatus(), InAppPurchaseStatus::ACTIVE);
        static::assertSame($firstPurchase->getIdentifier(), 'testFeature');

        $lastPurchase = $response->last();
        static::assertInstanceOf(InAppPurchaseStruct::class, $lastPurchase);
        static::assertSame($lastPurchase->getStatus(), InAppPurchaseStatus::ACTIVE);
        static::assertSame($lastPurchase->getIdentifier(), 'testFeature2');
    }

    private function getAllPurchases(): InAppPurchaseCollection
    {
        return InAppPurchaseCollection::fromArray([
            [
                'extensionName' => 'testExtension',
                'identifier' => 'testFeature',
                'name' => 'Test Feature',
                'description' => null,
                'priceModels' => [[
                    'variant' => 'yearly',
                    'type' => 'rent',
                    'price' => 59.5,
                    'duration' => 12,
                    'oneTimeOnly' => false,
                    'conditionsType' => null,
                ]],
                'status' => InAppPurchaseStatus::ACTIVE,
            ], [
                'extensionName' => 'testExtension',
                'identifier' => 'testFeature2',
                'name' => 'Test Feature 2',
                'description' => null,
                'priceModels' => [[
                    'variant' => 'monthly',
                    'type' => 'rent',
                    'price' => 1.5,
                    'duration' => 1,
                    'oneTimeOnly' => false,
                    'conditionsType' => null,
                ]],
                'status' => InAppPurchaseStatus::ACTIVE,
            ], [
                'extensionName' => 'testExtension',
                'identifier' => 'testFeature3',
                'name' => 'Test Feature 3',
                'description' => null,
                'priceModels' => [[
                    'variant' => 'monthly',
                    'type' => 'rent',
                    'price' => 1.5,
                    'duration' => 1,
                    'oneTimeOnly' => false,
                    'conditionsType' => null,
                ]],
                'status' => InAppPurchaseStruct::STATUS_INACTIVE,
            ],
        ]);
    }
}
