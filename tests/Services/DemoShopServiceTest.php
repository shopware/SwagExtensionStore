<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Authentication\StoreRequestOptionsProvider;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use SwagExtensionStore\Services\DemoShopService;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Struct\DemoShopInformationStruct;

class DemoShopServiceTest extends TestCase
{
    public function testItDelegatesDemoShopDetectionToTheStoreClient(): void
    {
        $context = Context::createDefaultContext();
        $information = DemoShopInformationStruct::fromArray([
            'remainingDays' => 5,
            'expirationDate' => '2099-12-31',
            'accountLink' => 'https://account.shopware.com/shops/demoshops/1',
            'contact' => null,
        ]);
        $client = $this->createMock(StoreClient::class);
        $client->expects(static::once())
            ->method('getDemoShopInformation')
            ->with($context)
            ->willReturn($information);

        $result = (new DemoShopService($client, $this->createSystemConfigService('shop-s3cret')))
            ->getDemoShopInformation($context);

        static::assertSame($information, $result);
    }

    public function testItSkipsTheStoreRequestWhenTheShopSecretIsMissing(): void
    {
        $client = $this->createMock(StoreClient::class);
        $client->expects(static::never())
            ->method('getDemoShopInformation');

        $result = (new DemoShopService($client, $this->createSystemConfigService('')))
            ->getDemoShopInformation(Context::createDefaultContext());

        static::assertNull($result);
    }

    private function createSystemConfigService(string $shopSecret): SystemConfigService
    {
        $systemConfigService = $this->createMock(SystemConfigService::class);
        $systemConfigService->method('getString')
            ->with(StoreRequestOptionsProvider::CONFIG_KEY_STORE_SHOP_SECRET)
            ->willReturn($shopSecret);

        return $systemConfigService;
    }
}
