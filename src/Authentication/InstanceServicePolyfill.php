<?php declare(strict_types=1);

namespace SwagExtensionStore\Authentication;

use Shopware\Core\Kernel;

/**
 * @deprecated tag:v2.0.0 - Will be removed and its usages replaced by Shopware\Core\Framework\Store\Services\InstanceService
 */
class InstanceServicePolyfill
{
    private string $shopwareVersion;
    private ?string $instanceId;

    public function __construct(string $shopwareVersion, ?string $instanceId)
    {
        $this->shopwareVersion = $shopwareVersion;
        $this->instanceId = $instanceId;
    }

    public function getShopwareVersion(): string
    {
        if ($this->shopwareVersion === Kernel::SHOPWARE_FALLBACK_VERSION) {
            return '___VERSION___';
        }

        return $this->shopwareVersion;
    }

    public function getInstanceId(): ?string
    {
        return $this->instanceId;
    }
}
