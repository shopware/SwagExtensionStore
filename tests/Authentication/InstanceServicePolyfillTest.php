<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Authentication;

use Shopware\Core\Kernel;
use SwagExtensionStore\Authentication\InstanceServicePolyfill;
use PHPUnit\Framework\TestCase;

class InstanceServicePolyfillTest extends TestCase
{
    public function testItReturnsInstanceIdIfNull(): void
    {
        $instanceServicePolyfill = new InstanceServicePolyfill(
            '6.4.0.0',
            null
        );

        static::assertNull($instanceServicePolyfill->getInstanceId());
    }

    public function testItReturnsInstanceIdIfSet(): void
    {
        $instanceServicePolyfill = new InstanceServicePolyfill(
            '6.4.0.0',
            'i-am-unique'
        );

        static::assertEquals('i-am-unique', $instanceServicePolyfill->getInstanceId());
    }

    public function testItReturnsSpecificShopwareVersion(): void
    {
        $instanceServicePolyfill = new InstanceServicePolyfill(
            '6.1.0.0',
            null
        );

        static::assertEquals('6.1.0.0', $instanceServicePolyfill->getShopwareVersion());
    }

    public function testItReturnsShopwareVersionStringIfVersionIsDeveloperVersion(): void
    {
        $instanceServicePolyfill = new InstanceServicePolyfill(
            Kernel::SHOPWARE_FALLBACK_VERSION,
            null
        );

        static::assertEquals('___VERSION___', $instanceServicePolyfill->getShopwareVersion());
    }
}
