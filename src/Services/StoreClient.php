<?php

namespace SwagExtensionStore\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Authentication\AbstractAuthenticationProvider;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use Shopware\Core\Framework\Store\Services\StoreService;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\System\SystemConfig\SystemConfigService;

class StoreClient
{
    private Client $client;

    private const SHOPWARE_PLATFORM_TOKEN_HEADER = 'X-Shopware-Platform-Token';
    private const SHOPWARE_SHOP_SECRET_HEADER = 'X-Shopware-Shop-Secret';

    private StoreService $storeService;
    private SystemConfigService $configService;
    private AbstractAuthenticationProvider $authenticationProvider;
    private array $endpoints;

    public function __construct(
        array $endpoints,
        StoreService $storeService,
        SystemConfigService $configService,
        AbstractAuthenticationProvider $authenticationProvider,
        Client $client
    ) {
        $this->endpoints = $endpoints;
        $this->storeService = $storeService;
        $this->configService = $configService;
        $this->authenticationProvider = $authenticationProvider;
        $this->client = $client;
    }

    public function getCategories(Context $context): array
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->get($this->endpoints['categories'], [
                'query' => $this->storeService->getDefaultQueryParameters($language, false),
                'headers' => $this->getHeaders(),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function listExtensions(ExtensionCriteria $criteria, Context $context): array
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->get($this->endpoints['list_extensions'], [
                'query' => array_merge($this->storeService->getDefaultQueryParameters($language, false), $criteria->getQueryParameter()),
                'headers' => $this->getHeaders(),
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
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->get($this->endpoints['filter'], [
                'query' => array_merge($this->storeService->getDefaultQueryParameters($language, false), $parameters),
                'headers' => $this->getHeaders(),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetail(int $id, Context $context): array
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->get(sprintf($this->endpoints['extension_detail'], $id), [
                'query' => $this->storeService->getDefaultQueryParameters($language, false),
                'headers' => $this->getHeaders(),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function extensionDetailReviews(int $id, ExtensionCriteria $criteria, Context $context): array
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->get(sprintf($this->endpoints['reviews'], $id), [
                'query' => array_merge($this->storeService->getDefaultQueryParameters($language, false), $criteria->getQueryParameter()),
                'headers' => $this->getHeaders(),
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }

        return json_decode((string) $response->getBody(), true);
    }

    public function createCart(int $extensionId, int $variantId, Context $context): CartStruct
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->client->post($this->endpoints['create_basket'], [
                'query' => $this->storeService->getDefaultQueryParameters($language, false),
                'headers' => $this->getHeaders($this->authenticationProvider->getUserStoreToken($context)),
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
            $this->client->post($this->endpoints['order_basket'], [
                'query' => $this->storeService->getDefaultQueryParameters('en-GB', false),
                'headers' => $this->getHeaders($this->authenticationProvider->getUserStoreToken($context)),
                'json' => $cartStruct,
            ]);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }

    public function availablePaymentMeans(Context $context): array
    {
        try {
            $response = $this->client->get($this->endpoints['payment_means'], [
                'query' => $this->storeService->getDefaultQueryParameters('en-GB', false),
                'headers' => $this->getHeaders($this->authenticationProvider->getUserStoreToken($context)),
            ]);

            return json_decode((string) $response->getBody(), true);
        } catch (ClientException $e) {
            throw new StoreApiException($e);
        }
    }

    private function getClient(): Client
    {
        if ($this->client === null) {
            $this->client = $this->storeService->createClient();
        }

        return $this->client;
    }

    private function getHeaders(?string $storeToken = null): array
    {
        $headers = $this->client->getConfig('headers');

        if ($storeToken) {
            $headers[self::SHOPWARE_PLATFORM_TOKEN_HEADER] = $storeToken;
        }

        $shopSecret = $this->configService->get('core.store.shopSecret');
        if ($shopSecret) {
            $headers[self::SHOPWARE_SHOP_SECRET_HEADER] = $shopSecret;
        }

        return $headers;
    }
}
