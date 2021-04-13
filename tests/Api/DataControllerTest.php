<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Api;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Store\Api\ExtensionStoreDataController;
use Shopware\Core\Framework\Test\Store\ExtensionBehaviour;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Core\Framework\Uuid\Uuid;
use SwagExtensionStore\Controller\DataController;
use SwagExtensionStore\Services\StoreDataProvider;
use Symfony\Component\HttpFoundation\Request;

class DataControllerTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;
    use ExtensionBehaviour;

    /**
     * @var DataController
     */
    private $controller;

    protected function setUp(): void
    {
        Feature::skipTestIfInActive('FEATURE_NEXT_12608', $this);
        parent::setUp();
        $this->controller = $this->getContainer()->get(DataController::class);
    }

    public function testExtensionList(): void
    {
        $this->setListingResponse();

        $response = $this->controller->getExtensionList(new Request(), Context::createDefaultContext());

        $data = json_decode($response->getContent(), true);

        static::assertSame(2, $data['meta']['total']);
        static::assertSame('TestApp', $data['data'][0]['name']);
    }

    public function testExtensionListPost(): void
    {
        $this->setListingResponse();

        $request = new Request();
        $request->setMethod('POST');
        $response = $this->controller->getExtensionList($request, Context::createDefaultContext());

        $data = json_decode($response->getContent(), true);

        static::assertSame(2, $data['meta']['total']);
        static::assertSame('TestApp', $data['data'][0]['name']);
    }

    public function testListingFilters(): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(200, [], file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json')));

        $response = $this->controller->listingFilters(new Request(), Context::createDefaultContext());

        static::assertSame(json_encode(json_decode(file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json'))), $response->getContent());
    }

    public function testDetail(): void
    {
        $this->setDetailResponse(12161);
        $response = $this->controller->detail(12161, Context::createDefaultContext());
        $data = json_decode($response->getContent(), true);

        static::assertSame(12161, $data['id']);
        static::assertSame('Tes12SWCloudApp1', $data['name']);
    }

    public function testReviews(): void
    {
        $extensionId = 12161;

        $this->setReviewsResponse($extensionId);
        $response = $this->controller->reviews($extensionId, new Request(), Context::createDefaultContext());
        $data = json_decode($response->getContent(), true);

        static::assertArrayHasKey('summary', $data);
        static::assertSame(7, $data['summary']['numberOfRatings']);
        static::assertArrayHasKey('reviews', $data);
    }

    public function testCategories(): void
    {
        $categoryResponse = \file_get_contents(__DIR__ . '/../_fixtures/categories-listing.json');
        // add extensions to compare structs later
        $categoryAsArray = array_map(function ($category) {
            $category['extensions'] = [];

            return $category;
        }, \json_decode($categoryResponse, true));

        $this->getRequestHandler()->reset();
        $this->getRequestHandler()->append(new Response(200, [], $categoryResponse));

        $response = $this->controller->getCategories(Context::createDefaultContext(new AdminApiSource(Uuid::randomHex())));

        static::assertSame(json_encode($categoryAsArray), $response->getContent());
    }

    private function setListingResponse(): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(
            200,
            [StoreDataProvider::HEADER_NAME_TOTAL_COUNT => '2'],
            \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-listing.json')
        ));
    }

    private function setDetailResponse($extensionId): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (\GuzzleHttp\Psr7\Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)/', $request->getUri()->getPath(), $matches);

                static::assertEquals(
                    $extensionId,
                    $matches[1]
                );

                return new Response(
                    200,
                    [],
                    \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-detail.json')
                );
            }
        );
    }

    private function setReviewsResponse($extensionId): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (\GuzzleHttp\Psr7\Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)\/reviews/', $request->getUri()->getPath(), $matches);

                static::assertEquals(
                    $extensionId,
                    $matches[1]
                );

                return new Response(
                    200,
                    [],
                    \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-reviews.json')
                );
            }
        );
    }
}