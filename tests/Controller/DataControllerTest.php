<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Test\Store\ExtensionBehaviour;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Controller\DataController;
use SwagExtensionStore\Services\StoreDataProvider;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class DataControllerTest extends TestCase
{
    use ExtensionBehaviour;
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    private DataController $controller;

    protected function setUp(): void
    {
        $this->controller = static::getContainer()->get(DataController::class);
    }

    public function testExtensionList(): void
    {
        $this->setListingResponse();

        $response = $this->controller->getExtensionList(new Request(), Context::createDefaultContext());
        $data = json_decode($this->assertResponseContent($response), true);

        static::assertSame(2, $data['meta']['total']);
        static::assertSame('TestApp', $data['data'][0]['name']);
    }

    public function testExtensionListPost(): void
    {
        $this->setListingResponse();

        $request = new Request();
        $request->setMethod('POST');
        $response = $this->controller->getExtensionList($request, Context::createDefaultContext());

        $data = json_decode($this->assertResponseContent($response), true);

        static::assertSame(2, $data['meta']['total']);
        static::assertSame('TestApp', $data['data'][0]['name']);
    }

    public function testListingFilters(): void
    {
        $filterJson = file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json');
        static::assertIsString($filterJson);

        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(200, [], $filterJson));

        $response = $this->controller->listingFilters(new Request(), Context::createDefaultContext());
        static::assertJsonStringEqualsJsonFile(__DIR__ . '/../_fixtures/responses/filter.json', $this->assertResponseContent($response));
    }

    public function testDetail(): void
    {
        $this->setDetailResponse(12161);
        $response = $this->controller->detail(12161, Context::createDefaultContext());
        $data = json_decode($this->assertResponseContent($response), true);

        static::assertSame(12161, $data['id']);
        static::assertSame('Tes12SWCloudApp1', $data['name']);
    }

    public function testReviews(): void
    {
        $extensionId = 12161;

        $this->setReviewsResponse($extensionId);
        $response = $this->controller->reviews($extensionId, new Request(), Context::createDefaultContext());
        $data = json_decode($this->assertResponseContent($response), true);

        static::assertArrayHasKey('summary', $data);
        static::assertSame(7, $data['summary']['numberOfRatings']);
        static::assertArrayHasKey('reviews', $data);
    }

    private function setListingResponse(): void
    {
        $extensionListingJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-listing.json');
        static::assertIsString($extensionListingJson);

        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(
            200,
            [StoreDataProvider::HEADER_NAME_TOTAL_COUNT => '2'],
            $extensionListingJson,
        ));
    }

    private function setDetailResponse(int $extensionId): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (\GuzzleHttp\Psr7\Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)/', $request->getUri()->getPath(), $matches);

                static::assertArrayHasKey(1, $matches);
                static::assertSame($extensionId, (int) $matches[1]);

                $extensionDetailJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-detail.json');
                static::assertIsString($extensionDetailJson);

                return new Response(200, [], $extensionDetailJson);
            },
        );
    }

    private function setReviewsResponse(int $extensionId): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (\GuzzleHttp\Psr7\Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)\/reviews/', $request->getUri()->getPath(), $matches);

                static::assertArrayHasKey(1, $matches);
                static::assertSame($extensionId, (int) $matches[1]);

                $extensionReviewsJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-reviews.json');
                static::assertIsString($extensionReviewsJson);

                return new Response(200, [], $extensionReviewsJson);
            },
        );
    }

    private function assertResponseContent(SymfonyResponse $response): string
    {
        $content = $response->getContent();
        static::assertIsString($content);

        return $content;
    }
}
