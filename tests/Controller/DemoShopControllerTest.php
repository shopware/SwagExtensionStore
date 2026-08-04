<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use PHPUnit\Framework\TestCase;
use SwagExtensionStore\Controller\DemoShopController;
use SwagExtensionStore\Services\DemoShopService;

class DemoShopControllerTest extends TestCase
{
    public function testItReturnsDemoShopStatus(): void
    {
        $service = static::createStub(DemoShopService::class);
        $service->method('isDemoShop')->willReturn(true);

        $response = (new DemoShopController($service))->getDemoShopStatus();

        static::assertSame(['isDemoShop' => true], json_decode((string) $response->getContent(), true));
    }

    public function testItReturnsRegularShopStatus(): void
    {
        $service = static::createStub(DemoShopService::class);
        $service->method('isDemoShop')->willReturn(false);

        $response = (new DemoShopController($service))->getDemoShopStatus();

        static::assertSame(['isDemoShop' => false], json_decode((string) $response->getContent(), true));
    }
}
