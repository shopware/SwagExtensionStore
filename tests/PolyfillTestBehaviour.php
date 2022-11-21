<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Core\Kernel;
use Shopware\Core\System\SystemConfig\SystemConfigService;

trait PolyfillTestBehaviour
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    protected function getStoreTokenFromContext(Context $context): string
    {
        /** @var AdminApiSource $source */
        $source = $context->getSource();

        return $this->getUserRepository()
            ->search(new Criteria([$source->getUserId()]), $context)
            ->first()->getStoreToken();
    }

    protected function setLicenseDomain(?string $licenseDomain): void
    {
        $systemConfigService = $this->getContainer()->get(SystemConfigService::class);

        $systemConfigService->set(
            'core.store.licenseHost',
            $licenseDomain
        );
    }

    protected function setShopSecret(string $shopSecret): void
    {
        $systemConfigService = $this->getContainer()->get(SystemConfigService::class);

        $systemConfigService->set(
            'core.store.shopSecret',
            $shopSecret
        );
    }

    protected function getShopwareVersion(): string
    {
        $version = $this->getContainer()->getParameter('kernel.shopware_version');

        return $version === Kernel::SHOPWARE_FALLBACK_VERSION ? '___VERSION___' : $version;
    }

    protected function getUserRepository(): EntityRepository
    {
        return $this->getContainer()->get('user.repository');
    }
}
