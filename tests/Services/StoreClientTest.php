<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\StoreClient;

class StoreClientTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    private Context $context;

    private StoreClient $storeClient;

    protected function setUp(): void
    {
        $this->context = Context::createDefaultContext();
        $this->storeClient = static::getContainer()->get(StoreClient::class);
    }

    public function testListExtensionsException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->listExtensions(new ExtensionCriteria(), $this->context);
    }

    public function testListListingFiltersException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->listListingFilters([], $this->context);
    }

    public function testExtensionDetailException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->extensionDetail(1337, $this->context);
    }

    public function testExtensionDetailReviewsException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->extensionDetailReviews(1337, new ExtensionCriteria(), $this->context);
    }

    public function testCreateCartException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->createCart(69, 1337, $this->context);
    }

    public function testOrderCartException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->orderCart(new CartStruct(), $this->context);
    }

    public function testAvailablePaymentMeans(): void
    {
        $this->setUpFilterRequestHandler();

        $response = $this->storeClient->availablePaymentMeans($this->context);

        static::assertArrayHasKey('filter', $response);
        static::assertCount(3, $response['filter']);
        static::assertArrayHasKey('sorting', $response);
        static::assertCount(5, $response['sorting']['options']);
    }

    public function testAvailablePaymentMeansException(): void
    {
        $this->setUpFilterRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->availablePaymentMeans($this->context);
    }

    public function testCreateInAppPurchaseCartException(): void
    {
        $this->setUpIapRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->createInAppPurchaseCart('testExtension', 'testFeature', $this->context);
    }

    public function testOrderInAppPurchaseCartException(): void
    {
        $this->setUpIapRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->orderInAppPurchaseCart('testExtension', 'testFeature', $this->context);
    }

    private function setUpFilterRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $filterJson = file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json');
        static::assertIsString($filterJson);
        $requestHandler->append(new Response($statusCode, [], $filterJson));
    }

    private function setUpIapRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->append(new Response($statusCode, []));
    }
}
