<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Log\Package;

#[Package('checkout')]
class DemoShopService
{
    /**
     * Name of the bundle that is only shipped with a CE demo shop. Has to match the
     * bundle name the demo instances are provisioned with.
     */
    public const DEMO_SHOP_BUNDLE_NAME = 'DemoShopBundleNamePlaceholder';

    /**
     * @param array<string, class-string> $kernelBundles bundle name to class, from %kernel.bundles%
     */
    public function __construct(private readonly array $kernelBundles)
    {
    }

    public function isDemoShop(): bool
    {
        return isset($this->kernelBundles[self::DEMO_SHOP_BUNDLE_NAME]);
    }
}
