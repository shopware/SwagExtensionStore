<?php

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Services\StoreService;
use Shopware\Core\Framework\Store\Struct\ExtensionCollection;
use Shopware\Core\Framework\Store\Struct\ReviewCollection;
use Shopware\Core\Framework\Store\Struct\ReviewSummaryStruct;
use Shopware\Core\Framework\Test\Store\ExtensionBehaviour;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use SwagExtensionStore\Services\ExtensionDataProvider;

class ExtensionDataProviderTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;
    use ExtensionBehaviour;

    /**
     * @var ExtensionDataProvider
     */
    private $extensionDataProvider;

    /**
     * @var Context
     */
    private $context;

    public function setUp(): void
    {
        $this->extensionDataProvider = $this->getContainer()->get(ExtensionDataProvider::class);
        $this->context = $this->createAdminStoreContext();

        $this->installApp(__DIR__ . '/../_fixtures/TestApp');
    }

    protected function tearDown(): void
    {
        $this->removeApp(__DIR__ . '/../_fixtures/TestApp');
    }

    public function testGetListingFilters(): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(200, [], file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json')));

        $filters = $this->extensionDataProvider->getListingFilters([], Context::createDefaultContext());

        static::assertSame(json_decode(file_get_contents(__DIR__ . '/../_fixtures/responses/filter.json'), true), $filters);
    }

    public function testItReturnsAListing(): void
    {
        $this->setListingResponse();

        $criteria = ExtensionCriteria::fromArray([
            'limit' => 10,
            'page' => 1,
        ]);

        $listing = $this->extensionDataProvider->getListing($criteria, $this->context);

        static::assertInstanceOf(ExtensionCollection::class, $listing);
        static::assertEquals(2, $listing->count());
    }

    public function testItLoadsRemoteExtensions(): void
    {
        $this->getContainer()->get(SystemConfigService::class)->set(StoreService::CONFIG_KEY_STORE_LICENSE_DOMAIN, 'localhost');
        $this->getRequestHandler()->reset();
        $this->getRequestHandler()->append(new Response(200, [], \file_get_contents(__DIR__ . '/../_fixtures/responses/my-licenses.json')));

        $installedExtensions = $this->extensionDataProvider->getInstalledExtensions($this->context, true);
        static::assertEquals(7, $installedExtensions->count());
    }

    public function testItReturnsAnExtensionDetail(): void
    {
        $extensionId = 12161;

        $this->setDetailResponse($extensionId);
        $extensionDetail = $this->extensionDataProvider->getExtensionDetails($extensionId, $this->context);

        static::assertNotNull($extensionDetail);
        static::assertEquals($extensionId, $extensionDetail->getId());
        static::assertEquals('Change your privacy policy!', $extensionDetail->getPrivacyPolicyExtension());
    }

    public function testItReturnsReviewsForExtension(): void
    {
        $extensionId = 12161;

        $this->setReviewsResponse($extensionId);
        $extensionReviews = $this->extensionDataProvider->getReviews($extensionId, new ExtensionCriteria(), $this->context);

        static::assertInstanceOf(ReviewCollection::class, $extensionReviews['reviews']);
        static::assertInstanceOf(ReviewSummaryStruct::class, $extensionReviews['summary']);
        static::assertCount(3, $extensionReviews['reviews']);
        static::assertEquals(7, $extensionReviews['summary']->getNumberOfRatings());
    }

    private function setReviewsResponse($extensionId): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (Request $request) use ($extensionId): Response {
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

    private function setListingResponse(): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(new Response(
            200,
            [ExtensionDataProvider::HEADER_NAME_TOTAL_COUNT => '2'],
            \file_get_contents(__DIR__ . '/../_fixtures/responses/extension-listing.json')
        ));
    }

    private function setDetailResponse($extensionId): void
    {
        $requestHandler = $this->getRequestHandler();
        $requestHandler->reset();
        $requestHandler->append(
            function (Request $request) use ($extensionId): Response {
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
}
