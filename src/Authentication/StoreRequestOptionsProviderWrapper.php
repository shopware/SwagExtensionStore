<?php declare(strict_types=1);

namespace SwagExtensionStore\Authentication;

use Shopware\Core\Framework\Context;

/**
 * @deprecated tag:v2.0.0 - Will be removed and its usages replaced by Shopware\Core\Framework\Store\Authentication\StoreRequestOptionsProvider
 */
class StoreRequestOptionsProviderWrapper
{
    private StoreRequestOptionsProviderPolyfill $polyfill;

    /**
     * @var \Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider|null
     */
    private $abstractStoreRequestOptionsProvider;

    public function __construct(
        StoreRequestOptionsProviderPolyfill $polyfill,
        $abstractStoreRequestOptionsProvider
    ) {
        $this->polyfill = $polyfill;
        $this->abstractStoreRequestOptionsProvider = $abstractStoreRequestOptionsProvider;
    }

    public function getAuthenticationHeader(Context $context): array
    {
        return $this->getImplementation()->getAuthenticationHeader($context);
    }

    public function getDefaultQueryParametersFromContext(Context $context): array
    {
        return $this->getImplementation()->getDefaultQueryParameters($context);
    }

    /**
     * @return \Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider|StoreRequestOptionsProviderPolyfill
     */
    private function getImplementation()
    {
        return $this->abstractStoreRequestOptionsProvider ?? $this->polyfill;
    }
}
