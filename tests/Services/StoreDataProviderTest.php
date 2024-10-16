<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Struct\ReviewCollection;
use Shopware\Core\Framework\Store\Struct\ReviewSummaryStruct;
use Shopware\Core\Framework\Test\Store\ExtensionBehaviour;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\StoreDataProvider;

class StoreDataProviderTest extends TestCase
{
    use ExtensionBehaviour;
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    private StoreDataProvider $extensionDataProvider;

    private Context $context;

    protected function setUp(): void
    {
        $this->extensionDataProvider = static::getContainer()->get(StoreDataProvider::class);
        $this->context = $this->createAdminStoreContext();

        $this->installApp(__DIR__ . '/../_fixtures/TestApp');
    }

    protected function tearDown(): void
    {
        $this->removeApp(__DIR__ . '/../_fixtures/TestApp');
    }

    public function testGetListingFilters(): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $filterJson = file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json');
        static::assertIsString($filterJson);
        $requestHandler->append(new Response(200, [], $filterJson));

        $filters = $this->extensionDataProvider->getListingFilters([], Context::createDefaultContext());

        $filterJson = file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json');
        static::assertIsString($filterJson);
        static::assertSame(json_decode($filterJson, true), $filters);
    }

    public function testItReturnsAListing(): void
    {
        $this->setListingResponse();

        $criteria = ExtensionCriteria::fromArray([
            'limit' => 10,
            'page' => 1,
        ]);

        $listing = $this->extensionDataProvider->getListing($criteria, $this->context);

        static::assertCount(2, $listing);
    }

    public function testItReturnsAnExtensionDetail(): void
    {
        $extensionId = 12161;

        $this->setDetailResponse($extensionId);
        $extensionDetail = $this->extensionDataProvider->getExtensionDetails($extensionId, $this->context);

        static::assertSame($extensionId, $extensionDetail->getId());
        static::assertSame('Change your privacy policy!', $extensionDetail->getPrivacyPolicyExtension());
    }

    public function testItReturnsReviewsForExtension(): void
    {
        $extensionId = 12161;

        $this->setReviewsResponse($extensionId);
        $extensionReviews = $this->extensionDataProvider->getReviews($extensionId, new ExtensionCriteria(), $this->context);

        static::assertInstanceOf(ReviewCollection::class, $extensionReviews['reviews']);
        static::assertInstanceOf(ReviewSummaryStruct::class, $extensionReviews['summary']);
        static::assertCount(3, $extensionReviews['reviews']);
        static::assertSame(7, $extensionReviews['summary']->getNumberOfRatings());
    }

    private function setReviewsResponse(int $extensionId): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)\/reviews/', $request->getUri()->getPath(), $matches);

                static::assertArrayHasKey(1, $matches);
                static::assertSame($extensionId, (int) $matches[1]);

                $extensionReviewsJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-reviews.json');
                self::assertIsString($extensionReviewsJson);

                return new Response(200, [], $extensionReviewsJson);
            },
        );
    }

    private function setListingResponse(): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->reset();
        $extensionListingJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-listing.json');
        static::assertIsString($extensionListingJson);
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
            function (Request $request) use ($extensionId): Response {
                $matches = [];
                preg_match('/\/swplatform\/extensionstore\/extensions\/(.*)/', $request->getUri()->getPath(), $matches);

                static::assertArrayHasKey(1, $matches);
                static::assertSame($extensionId, (int) $matches[1]);

                $extensionDetailJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-detail.json');
                self::assertIsString($extensionDetailJson);

                return new Response(200, [], $extensionDetailJson);
            },
        );
    }
}
