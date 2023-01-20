<?php declare(strict_types=1);

namespace SwagExtensionStore\Services;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Struct\CartStruct;

/**
 * @phpstan-type SbpEndpoints array<string, string>
 * @phpstan-type RequestQueryParameters array<string, string>
 * @phpstan-type ResponseHeaders array<string, list<string>>
 * @phpstan-type ExtensionInfo array<string, mixed>
 * @phpstan-type ExtensionDetail array<string, mixed>
 * @phpstan-type ExtensionListingFilterOption array{name: string, value: string, label: string, position: int, parent: string}
 * @phpstan-type ExtensionListingFilter array{type: string, name: label, position: int, options: list<ExtensionListingFilterOption>}
 * @phpstan-type ExtensionListingSortingOption array{orderBy: string, orderSequence: 'asc'|'desc', label: string, position: int}
 * @phpstan-type ExtensionListingSorting array{default: ExtensionListingSortingOption, options: list<ExtensionListingSortingOption>}
 * @phpstan-type ExtensionReview array<string, mixed>
 * @phpstan-type PaymentMethod array{id: positive-int, type: 'paypal'|'creditCard'|'directDebit', label: string, default: bool}
 */
class StoreClient
{
    public function __construct(
        /** @var SbpEndpoints $endpoints */
        private readonly array $endpoints,
        private readonly AbstractStoreRequestOptionsProvider $storeRequestOptionsProvider,
        private readonly ClientInterface $client,
    ) {
    }

    /**
     * @return array{headers: ResponseHeaders, data: list<ExtensionInfo>}
     */
    public function listExtensions(ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['list_extensions'],
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParameters($context), $criteria->getQueryParameter()),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        /** @var list<ExtensionInfo> $body */
        $body = json_decode((string) $response->getBody(), true);

        return [
            'headers' => $response->getHeaders(),
            'data' => $body,
        ];
    }

    /**
     * @param RequestQueryParameters $parameters
     *
     * @return array{filter: list<ExtensionListingFilter>, sorting: ExtensionListingSorting}
     */
    public function listListingFilters(array $parameters, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['filter'],
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParameters($context), $parameters),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    /**
     * @return ExtensionDetail
     */
    public function extensionDetail(int $id, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                sprintf($this->endpoints['extension_detail'], $id),
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    /**
     * @return array{
     *     reviews: list<ExtensionReview>,
     *     summary: array{
     *         ratingAssignment: list<array{rating: int<1, 5>, count: positive-int}>,
     *         averageRating: float<0, 5>,
     *         numberOfRatings: positive-int
     *     }}
     */
    public function extensionDetailReviews(int $id, ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                sprintf($this->endpoints['reviews'], $id),
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParameters($context), $criteria->getQueryParameter()),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function createCart(int $extensionId, int $variantId, Context $context): CartStruct
    {
        try {
            $response = $this->client->request(
                'POST',
                $this->endpoints['create_basket'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                    'json' => [
                        'extensions' => [
                            [
                                'extensionId' => $extensionId,
                                'variantId' => $variantId,
                            ],
                        ],
                    ],
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return CartStruct::fromArray(json_decode((string) $response->getBody(), true));
    }

    public function orderCart(CartStruct $cartStruct, Context $context): void
    {
        try {
            $this->client->request(
                'POST',
                $this->endpoints['order_basket'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                    'json' => $cartStruct,
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }

    /**
     * @return list<PaymentMethod>
     */
    public function availablePaymentMeans(Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['payment_means'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );

            return json_decode((string) $response->getBody(), true);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }
}
