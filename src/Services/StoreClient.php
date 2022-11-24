<?php declare(strict_types=1);

namespace SwagExtensionStore\Services;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use SwagExtensionStore\Authentication\StoreRequestOptionsProviderWrapper;

class StoreClient
{
    private array $endpoints;
    private StoreRequestOptionsProviderWrapper $storeRequestOptionsProvider;
    private ClientInterface $client;

    public function __construct(
        array $endpoints,
        StoreRequestOptionsProviderWrapper $storeRequestOptionsProvider,
        ClientInterface $client
    ) {
        $this->endpoints = $endpoints;
        $this->storeRequestOptionsProvider = $storeRequestOptionsProvider;
        $this->client = $client;
    }

    public function listExtensions(ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['list_extensions'],
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $criteria->getQueryParameter()),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        $body = json_decode((string) $response->getBody(), true);

        return [
            'headers' => $response->getHeaders(),
            'data' => $body,
        ];
    }

    public function listListingFilters(array $parameters, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['filter'],
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $parameters),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetail(int $id, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                sprintf($this->endpoints['extension_detail'], $id),
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetailReviews(int $id, ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                sprintf($this->endpoints['reviews'], $id),
                [
                    'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $criteria->getQueryParameter()),
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
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
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
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                    'json' => $cartStruct,
                ]
            );
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }

    public function availablePaymentMeans(Context $context): array
    {
        try {
            $response = $this->client->request(
                'GET',
                $this->endpoints['payment_means'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ]
            );

            return json_decode((string) $response->getBody(), true);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }
}
