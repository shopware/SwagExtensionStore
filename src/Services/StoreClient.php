<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Authentication\AbstractStoreRequestOptionsProvider;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use SwagExtensionStore\Exception\ExtensionStoreException;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionStruct;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use SwagExtensionStore\Struct\InAppPurchaseStruct;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @phpstan-type SbpEndpoints array<string, string>
 * @phpstan-type PaymentMethod array{id: positive-int, type: 'paypal'|'creditCard'|'directDebit', label: string, default: bool}
 *
 * @phpstan-import-type InAppPurchaseCartItem from InAppPurchaseCartPositionStruct
 */
#[Package('checkout')]
class StoreClient
{
    /**
     * @param SbpEndpoints $endpoints
     */
    public function __construct(
        private readonly array $endpoints,
        private readonly AbstractStoreRequestOptionsProvider $storeRequestOptionsProvider,
        private readonly ClientInterface $client,
    ) {
    }

    public function createCart(int|string $extensionId, int|string $variantId, Context $context): CartStruct
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
                        'identifierBase' => 'storeUuid',
                    ],
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
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
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
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
                ],
            );

            return json_decode((string) $response->getBody(), true);
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
        }
    }

    public function createInAppPurchaseCart(string $extensionName, string $feature, string $variant, Context $context): InAppPurchaseCartStruct
    {
        try {
            $response = $this->client->request(
                'POST',
                $this->endpoints['iap_create_basket'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                    'json' => [
                        'extensionName' => $extensionName,
                        'inAppFeatureIdentifier' => $feature,
                        'variant' => $variant ?: null,
                    ],
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
        }

        $inAppPurchaseCart = InAppPurchaseCartStruct::fromArray(json_decode((string) $response->getBody(), true));
        $inAppPurchaseCart->getPositions()->map(function (InAppPurchaseCartPositionStruct $position) use ($extensionName): void {
            $position->setExtensionName($position->getExtensionName() ?: $extensionName);
        });

        return $inAppPurchaseCart;
    }

    /**
     * @param array<int, InAppPurchaseCartItem> $positions
     */
    public function orderInAppPurchaseCart(float $taxRate, array $positions, Context $context): JsonResponse
    {
        try {
            $this->client->request(
                'POST',
                $this->endpoints['iap_order_basket'],
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                    'json' => [
                        'taxRate' => $taxRate,
                        'positions' => $positions,
                    ],
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
        }

        return new JsonResponse(null, 201);
    }

    public function listInAppPurchases(string $extensionName, Context $context): InAppPurchaseCollection
    {
        try {
            $response = $this->client->request(
                'GET',
                \sprintf($this->endpoints['iap_list'], $extensionName),
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
        }

        return InAppPurchaseCollection::fromArray(json_decode((string) $response->getBody(), true));
    }

    public function getInAppPurchase(string $extensionName, string $inAppPurchase, Context $context): InAppPurchaseStruct
    {
        try {
            $response = $this->client->request(
                'GET',
                \sprintf($this->endpoints['iap_details'], $extensionName, $inAppPurchase),
                [
                    'query' => $this->storeRequestOptionsProvider->getDefaultQueryParameters($context),
                    'headers' => $this->storeRequestOptionsProvider->getAuthenticationHeader($context),
                ],
            );
        } catch (ClientException $e) {
            throw ExtensionStoreException::createStoreApiExceptionFromClientError($e);
        }

        return InAppPurchaseStruct::fromArray(json_decode((string) $response->getBody(), true));
    }
}
