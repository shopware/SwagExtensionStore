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
    private ?Client $client = null;

    private const SHOPWARE_PLATFORM_TOKEN_HEADER = 'X-Shopware-Platform-Token';
    private const SHOPWARE_SHOP_SECRET_HEADER = 'X-Shopware-Shop-Secret';

    private const SBP_API_LIST_FILTERS = '/swplatform/extensionstore/extensions/filter';
    private const SBP_API_DETAIL_EXTENSION = '/swplatform/extensionstore/extensions/%d';
    private const SBP_API_DETAIL_EXTENSION_REVIEWS = '/swplatform/extensionstore/extensions/%d/reviews';
    private const SBP_API_CREATE_CART = '/swplatform/extensionstore/baskets';
    private const SBP_API_ORDER_CART = '/swplatform/extensionstore/orders';
    private const SBP_API_LIST_EXTENSIONS = '/swplatform/extensionstore/extensions';
    private const SBP_API_LIST_CATEGORIES = '/swplatform/extensionstore/categories';

    private StoreService $storeService;
    private SystemConfigService $configService;
    private AbstractAuthenticationProvider $authenticationProvider;

    public function __construct(StoreService $storeService, SystemConfigService $configService, AbstractAuthenticationProvider $authenticationProvider)
    {
        $this->storeService = $storeService;
        $this->configService = $configService;
        $this->authenticationProvider = $authenticationProvider;
    }

    public function getCategories(Context $context): array
    {
        $language = $this->storeService->getLanguageByContext($context);

        try {
            $response = $this->getClient()->get(self::SBP_API_LIST_CATEGORIES, [
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
            $response = $this->getClient()->get(self::SBP_API_LIST_EXTENSIONS, [
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
            $response = $this->getClient()->get(self::SBP_API_LIST_FILTERS, [
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
            $response = $this->getClient()->get(sprintf(self::SBP_API_DETAIL_EXTENSION, $id), [
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
            $response = $this->getClient()->get(sprintf(self::SBP_API_DETAIL_EXTENSION_REVIEWS, $id), [
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
            $response = $this->getClient()->post(self::SBP_API_CREATE_CART, [
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
            $this->getClient()->post(self::SBP_API_ORDER_CART, [
                'query' => $this->storeService->getDefaultQueryParameters('en-GB', false),
                'headers' => $this->getHeaders($this->authenticationProvider->getUserStoreToken($context)),
                'json' => $cartStruct,
            ]);
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
        $headers = $this->getClient()->getConfig('headers');

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
