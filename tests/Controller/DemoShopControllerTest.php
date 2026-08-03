<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use SwagExtensionStore\Controller\DemoShopController;
use SwagExtensionStore\Services\DemoShopService;
use SwagExtensionStore\Struct\DemoShopInformationStruct;

class DemoShopControllerTest extends TestCase
{
    public function testItReturnsDemoShopInformation(): void
    {
        $information = DemoShopInformationStruct::fromArray([
            'remainingDays' => 5,
            'expirationDate' => '2099-12-31',
            'accountLink' => 'https://account.shopware.com/shops/demoshops/1',
            'contact' => null,
        ]);
        $service = static::createStub(DemoShopService::class);
        $service->method('getDemoShopInformation')->willReturn($information);

        $response = (new DemoShopController($service))->getDemoShopInformation(Context::createDefaultContext());

        static::assertSame([
            'isDemoShop' => true,
            'demoShopInformation' => $information->toArray(),
        ], json_decode((string) $response->getContent(), true));
    }

    public function testItReturnsRegularShopStatus(): void
    {
        $service = static::createStub(DemoShopService::class);
        $service->method('getDemoShopInformation')->willReturn(null);

        $response = (new DemoShopController($service))->getDemoShopInformation(Context::createDefaultContext());

        static::assertSame([
            'isDemoShop' => false,
            'demoShopInformation' => null,
        ], json_decode((string) $response->getContent(), true));
    }
}
