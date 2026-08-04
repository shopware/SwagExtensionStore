<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use PHPUnit\Framework\TestCase;
use SwagExtensionStore\Services\DemoShopService;

class DemoShopServiceTest extends TestCase
{
    public function testItDetectsADemoShopByTheDemoShopBundle(): void
    {
        $service = new DemoShopService([
            'FrameworkBundle' => 'Symfony\Bundle\FrameworkBundle\FrameworkBundle',
            'SwagExtensionStore' => 'SwagExtensionStore\SwagExtensionStore',
            DemoShopService::DEMO_SHOP_BUNDLE_NAME => 'Vendor\DemoShop\DemoShopBundleNamePlaceholder',
        ]);

        static::assertTrue($service->isDemoShop());
    }

    public function testItDetectsARegularShopWithoutTheDemoShopBundle(): void
    {
        $service = new DemoShopService([
            'FrameworkBundle' => 'Symfony\Bundle\FrameworkBundle\FrameworkBundle',
            'SwagExtensionStore' => 'SwagExtensionStore\SwagExtensionStore',
        ]);

        static::assertFalse($service->isDemoShop());
    }

    public function testItDetectsARegularShopWithoutAnyBundle(): void
    {
        static::assertFalse((new DemoShopService([]))->isDemoShop());
    }
}
