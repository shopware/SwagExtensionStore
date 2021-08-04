<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Authentication;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use PHPUnit\Framework\TestCase;
use SwagExtensionStore\Authentication\StoreRequestOptionsProviderPolyfill;
use SwagExtensionStore\Authentication\StoreRequestOptionsProviderWrapper;

class StoreRequestOptionsProviderWrapperTest extends TestCase
{
    use IntegrationTestBehaviour;

    public function testGetAuthenticationHeaderCanUsePolyFillAsFallback(): void
    {
        $polyfill = $this->createMock(StoreRequestOptionsProviderPolyfill::class);
        $polyfill->method('getAuthenticationHeader')
            ->willReturn(['test' => 'success']);

        $response = $this
            ->getStoreRequestOptionsProviderWrapper($polyfill, null)
            ->getAuthenticationHeader(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success'
        ], $response);
    }

    public function testGetDefaultQueryParametersFromContextCanUsePolyFillAsFallback(): void
    {
        $polyfill = $this->createMock(StoreRequestOptionsProviderPolyfill::class);
        $polyfill->method('getDefaultQueryParameters')
            ->willReturn(['test' => 'success']);

        $response = $this
            ->getStoreRequestOptionsProviderWrapper($polyfill, null)
            ->getDefaultQueryParametersFromContext(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success'
        ], $response);
    }

    public function testGetAuthenticationHeaderCanUseCorrectClassIfProvided(): void
    {
        if (!class_exists('\Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider', false)) {
            static::markTestSkipped("Skipped until 'AbstractStoreRequestOptionsProvider::class' is available.");
        }

        $mockedProvider = $this->createMock(AbstractStoreRequestOptionsProvider::class);
        $mockedProvider->method('getAuthenticationHeader')
            ->willReturn(['test' => 'success']);

        $response = $this
            ->getStoreRequestOptionsProviderWrapper(
                $this->getContainer()->get(StoreRequestOptionsProviderPolyfill::class),
                $mockedProvider
            )
            ->getAuthenticationHeader(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success'
        ], $response);
    }

    public function testGetDefaultQueryParametersFromContextCanUseCorrectClassIfProvided(): void
    {
        if (!class_exists('\Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider', false)) {
            static::markTestSkipped("Skipped until 'AbstractStoreRequestOptionsProvider::class' is available.");
        }

        $mockedProvider = $this->createMock(AbstractStoreRequestOptionsProvider::class);
        $mockedProvider->method('getDefaultQueryParameters')
            ->willReturn(['test' => 'success']);

        $response = $this
            ->getStoreRequestOptionsProviderWrapper(
                $this->getContainer()->get(StoreRequestOptionsProviderPolyfill::class),
                $mockedProvider
            )
            ->getDefaultQueryParametersFromContext(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success'
        ], $response);
    }

    private function getStoreRequestOptionsProviderWrapper(
        StoreRequestOptionsProviderPolyfill $polyfill,
        $abstractStoreRequestOptionsProvider): StoreRequestOptionsProviderWrapper
    {
        return new StoreRequestOptionsProviderWrapper($polyfill, $abstractStoreRequestOptionsProvider);
    }
}
