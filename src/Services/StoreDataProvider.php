<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Services\ExtensionLoader;
use Shopware\Core\Framework\Store\Struct\ExtensionCollection;
use Shopware\Core\Framework\Store\Struct\ExtensionStruct;
use Shopware\Core\Framework\Store\Struct\ReviewCollection;
use Shopware\Core\Framework\Store\Struct\ReviewSummaryStruct;

/**
 * @phpstan-import-type RequestQueryParameters from StoreClient
 * @phpstan-import-type ExtensionListingFilter from StoreClient
 * @phpstan-import-type ExtensionListingSorting from StoreClient
 */
#[Package('checkout')]
class StoreDataProvider
{
    public const HEADER_NAME_TOTAL_COUNT = 'SW-Meta-Total';

    private StoreClient $client;

    private ExtensionLoader $extensionLoader;

    public function __construct(StoreClient $client, ExtensionLoader $extensionLoader)
    {
        $this->client = $client;
        $this->extensionLoader = $extensionLoader;
    }

    /**
     * @param RequestQueryParameters $parameters
     *
     * @return array{filter: list<ExtensionListingFilter>, sorting: ExtensionListingSorting}
     */
    public function getListingFilters(array $parameters, Context $context): array
    {
        return $this->client->listListingFilters($parameters, $context);
    }

    public function getExtensionDetails(int $id, Context $context): ExtensionStruct
    {
        $detailResponse = $this->client->extensionDetail($id, $context);

        return $this->extensionLoader->loadFromArray($context, $detailResponse);
    }

    /**
     * @return array{summary: ReviewSummaryStruct, reviews: ReviewCollection}
     */
    public function getReviews(int $extensionId, ExtensionCriteria $criteria, Context $context): array
    {
        $reviewsResponse = $this->client->extensionDetailReviews($extensionId, $criteria, $context);

        return [
            'summary' => ReviewSummaryStruct::fromArray($reviewsResponse['summary']),
            'reviews' => new ReviewCollection($reviewsResponse['reviews']),
        ];
    }

    public function getListing(ExtensionCriteria $criteria, Context $context): ExtensionCollection
    {
        $listingResponse = $this->client->listExtensions($criteria, $context);
        $extensionListing = $this->extensionLoader->loadFromListingArray($context, $listingResponse['data']);

        $total = $listingResponse['headers'][self::HEADER_NAME_TOTAL_COUNT][0] ?? 0;
        $extensionListing->setTotal((int) $total);

        return $extensionListing;
    }
}
