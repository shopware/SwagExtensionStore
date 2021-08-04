<?php declare(strict_types=1);

namespace SwagExtensionStore\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use SwagExtensionStore\Authentication\StoreRequestOptionsProviderWrapper;

class StoreClient
{
    private EndpointProvider $endpointProvider;
    private SystemConfigService $configService;
    private StoreRequestOptionsProviderWrapper $storeRequestOptionsProvider;
    private Client $client;

    public function __construct(
        EndpointProvider $endpointProvider,
        SystemConfigService $configService,
        StoreRequestOptionsProviderWrapper $storeRequestOptionsProvider,
        Client $client
    ) {
        $this->endpointProvider = $endpointProvider;
        $this->configService = $configService;
        $this->storeRequestOptionsProvider = $storeRequestOptionsProvider;
        $this->client = $client;
    }

    public function getCategories(Context $context): array
    {
        try {
            $response = $this->client->get($this->endpointProvider->get('categories'), [
                'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function listExtensions(ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->get($this->endpointProvider->get('list_extensions'), [
                'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $criteria->getQueryParameter()),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);
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
            $response = $this->client->get($this->endpointProvider->get('filter'), [
                'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $parameters),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetail(int $id, Context $context): array
    {
        try {
            $response = $this->client->get(sprintf($this->endpointProvider->get('extension_detail'), $id), [
                'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetailReviews(int $id, ExtensionCriteria $criteria, Context $context): array
    {
        try {
            $response = $this->client->get(sprintf($this->endpointProvider->get('reviews'), $id), [
                'query' => array_merge($this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context), $criteria->getQueryParameter()),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function createCart(int $extensionId, int $variantId, Context $context): CartStruct
    {
        try {
            $response = $this->client->post($this->endpointProvider->get('create_basket'), [
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
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return CartStruct::fromArray(json_decode((string) $response->getBody(), true));
    }

    public function orderCart(CartStruct $cartStruct, Context $context): void
    {
        try {
            $this->client->post($this->endpointProvider->get('order_basket'), [
                'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                'json' => $cartStruct,
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }

    public function availablePaymentMeans(Context $context): array
    {
        try {
            $response = $this->client->get($this->endpointProvider->get('payment_means'), [
                'query' => $this->storeRequestOptionsProvider->getDefaultQueryParametersFromContext($context),
                'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }
}
