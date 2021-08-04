<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Services\ExtensionDownloader;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\BasketService;
use SwagExtensionStore\Services\StoreClient;

class BasketServiceTest extends TestCase
{
    use IntegrationTestBehaviour;

    public function testAvailablePaymentMeans(): void
    {
        $storeClientMock = $this->createMock(StoreClient::class);
        $storeClientMock->method('availablePaymentMeans')
            ->willReturn(['test' => 'success']);

        $response = (new BasketService(
            $storeClientMock,
            $this->getContainer()->get(ExtensionDownloader::class)
        ))->availablePaymentMeans(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success'
        ], $response);
    }
}
