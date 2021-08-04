<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Authentication;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Api\Context\Exception\InvalidContextSourceException;
use Shopware\Core\Framework\Api\Context\Exception\InvalidContextSourceUserException;
use Shopware\Core\Framework\Api\Context\SalesChannelApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\NotFilter;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use PHPUnit\Framework\TestCase;
use Shopware\Core\System\User\UserEntity;
use SwagExtensionStore\Authentication\LocaleProviderPolyfill;
use SwagExtensionStore\Authentication\StoreRequestOptionsProviderPolyfill;
use SwagExtensionStore\Tests\PolyfillTestBehaviour;

class StoreRequestOptionsProviderPolyfillTest extends TestCase
{
    use PolyfillTestBehaviour;

    private StoreRequestOptionsProviderPolyfill $storeRequestOptionsProvider;
    private SystemConfigService $systemConfigService;
    private Context $storeContext;

    public function setUp(): void
    {
        $this->storeRequestOptionsProvider = $this->getContainer()->get(StoreRequestOptionsProviderPolyfill::class);
        $this->systemConfigService = $this->getContainer()->get(SystemConfigService::class);
        $this->storeContext = $this->createAdminStoreContext();
    }

    public function testGetAuthenticationHeadersHasUserStoreTokenAndShopSecret(): void
    {
        $shopSecret = 'im-a-super-safe-secret';

        $this->setShopSecret($shopSecret);
        $headers = $this->storeRequestOptionsProvider->getAuthenticationHeader($this->storeContext);

        static::assertEquals([
            'X-Shopware-Platform-Token' => $this->getStoreTokenFromContext($this->storeContext),
            'X-Shopware-Shop-Secret' => $shopSecret,
        ], $headers);
    }

    public function testGetAuthenticationHeadersUsesFirstStoreTokenFoundIfContextIsSystemSource(): void
    {
        $shopSecret = 'im-a-super-safe-secret';

        $this->setShopSecret($shopSecret);
        $headers = $this->storeRequestOptionsProvider->getAuthenticationHeader($this->storeContext);

        static::assertEquals([
            'X-Shopware-Platform-Token' => $this->getStoreTokenFromContext($this->storeContext),
            'X-Shopware-Shop-Secret' => $shopSecret,
        ], $headers);
    }

    public function testGetAuthenticationHeadersThrowsForIntegrations(): void
    {
        $context = Context::createDefaultContext(new AdminApiSource(null, Uuid::randomHex()));

        static::expectException(InvalidContextSourceUserException::class);
        $this->storeRequestOptionsProvider->getAuthenticationHeader($context);
    }

    public function testGetTokenFromSystemContextSourceException(): void
    {
        $context = Context::createDefaultContext(new SalesChannelApiSource('some-sales-channel-id'));

        static::expectException(InvalidContextSourceException::class);
        $this->storeRequestOptionsProvider->getAuthenticationHeader($context);
    }

    public function testGetTokenFromSystemGetsCorrectStoreToken(): void
    {
        $context = Context::createDefaultContext();
        $response = $this->storeRequestOptionsProvider->getAuthenticationHeader($context);

        $criteria = new Criteria();
        $criteria->addFilter(
            new NotFilter(NotFilter::CONNECTION_OR, [new EqualsFilter('storeToken', null)])
        );

        $storeToken = $this->getUserRepository()
            ->search($criteria, $context)
            ->first()
            ->getStoreToken();

        static::assertSame($storeToken, $response['X-Shopware-Platform-Token']);
    }

    public function testGetTokenFromSystemHasNoTokenIfUserIsNotFound(): void
    {
        $context = Context::createDefaultContext();

        $this->getUserRepository()->update([[
            'id' => $this->storeContext->getSource()->getuserId(),
            'storeToken' => null
        ]], $context);

        $updateData = [];
        $this->getUserRepository()
            ->search(new Criteria(), $context)
            ->map(function(UserEntity $user) use ($context, &$updateData) {
                $updateData[] = [
                    'id' => $user->getId(),
                    'storeToken' => null,
                ];
            }
        );

        $this->getUserRepository()->update($updateData, $context);

        $response = $this->storeRequestOptionsProvider->getAuthenticationHeader($context);

        static::assertArrayNotHasKey('X-Shopware-Platform-Token', $response);
    }

    public function testGetDefaultQueriesReturnsLanguageFromContext(): void
    {
        $queries = $this->storeRequestOptionsProvider->getDefaultQueryParameters($this->storeContext);

        static::assertArrayHasKey('language', $queries);
        static::assertEquals(
            $this->getLanguageFromContext($this->storeContext),
            $queries['language']
        );
    }

    public function testGetDefaultQueriesReturnsShopwareVersion(): void
    {
        $queries = $this->storeRequestOptionsProvider->getDefaultQueryParameters($this->storeContext);

        static::assertArrayHasKey('shopwareVersion', $queries);
        static::assertEquals($this->getShopwareVersion(), $queries['shopwareVersion']);
    }

    public function testGetDefaultQueriesDoesNotHaveDomainSetIfLicenseDomainIsNull(): void
    {
        $this->setLicenseDomain(null);
        $queries = $this->storeRequestOptionsProvider->getDefaultQueryParameters($this->storeContext);

        static::assertSame('', $queries['domain']);
    }

    public function testGetDefaultQueriesWithLicenseDomain(): void
    {
        $this->setLicenseDomain('new-license-domain');
        $queries = $this->storeRequestOptionsProvider->getDefaultQueryParameters($this->storeContext);

        static::assertArrayHasKey('domain', $queries);
        static::assertEquals('new-license-domain', $queries['domain']);
    }

    public function testGetDefaultQueryParametersHasLanguageFallback(): void
    {
        $response = $this->storeRequestOptionsProvider->getDefaultQueryParameters(null);
        static::assertSame(LocaleProviderPolyfill::LANGUAGE_FALLBACK, $response['language']);
    }

    private function getLanguageFromContext(Context $context): string
    {
        $userId = $context->getSource()->getUserId();
        $criteria = (new Criteria([$userId]))->addAssociation('locale');
        $user = $this->getUserRepository()->search($criteria, $context)->first();

        return $user->getLocale()->getCode();
    }
}
