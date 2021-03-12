<?php

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Services\ExtensionDownloader;
use Shopware\Core\Framework\Store\Struct\CartPositionStruct;
use Shopware\Core\Framework\Store\Struct\CartStruct;

class LicenseService
{
    private StoreClient $client;
    private ExtensionDownloader $extensionDownloader;

    public function __construct(StoreClient $client, ExtensionDownloader $extensionDownloader)
    {
        $this->client = $client;
        $this->extensionDownloader = $extensionDownloader;
    }

    public function createCart(int $extensionId, int $variantId, Context $context): CartStruct
    {
        return $this->client->createCart($extensionId, $variantId, $context);
    }

    public function orderCart(CartStruct $cart, Context $context): void
    {
        $this->client->orderCart($cart, $context);
    }

    /**
     * @return array<string>
     */
    private function getExtensionNamesFromCart(CartStruct $cart): array
    {
        return array_map(static function (CartPositionStruct $position): string {
            return $position->getExtensionName();
        }, $cart->getPositions()->getElements());
    }
}
