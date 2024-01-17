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
        $this->storeClient = $this->getContainer()->get(StoreClient::class);
    }

    public function testListExtensionsException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->listExtensions(new ExtensionCriteria(), $this->context);
    }

    public function testListListingFiltersException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->listListingFilters([], $this->context);
    }

    public function testExtensionDetailException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->extensionDetail(1337, $this->context);
    }

    public function testExtensionDetailReviewsException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->extensionDetailReviews(1337, new ExtensionCriteria(), $this->context);
    }

    public function testCreateCartException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->createCart(69, 1337, $this->context);
    }

    public function testOrderCartException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->orderCart(new CartStruct(), $this->context);
    }

    public function testAvailablePaymentMeans(): void
    {
        $this->setUpRequestHandler();

        $response = $this->storeClient->availablePaymentMeans($this->context);

        static::assertArrayHasKey('filter', $response);
        static::assertCount(3, $response['filter']);
        static::assertArrayHasKey('sorting', $response);
        static::assertCount(5, $response['sorting']['options']);
    }

    public function testAvailablePaymentMeansException(): void
    {
        $this->setUpRequestHandler(400);

        static::expectException(StoreApiException::class);
        $this->storeClient->availablePaymentMeans($this->context);
    }

    private function setUpRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getRequestHandler();
        $filterJson = file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json');
        static::assertIsString($filterJson);
        $requestHandler->append(new Response($statusCode, [], $filterJson));
    }
}
