<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Store\Struct\CartPositionStruct;
use Shopware\Core\Framework\Store\Struct\PermissionCollection;
use Shopware\Core\Framework\Util\FloatComparator;

/**
 * @phpstan-import-type PaymentMethod from StoreClient
 */
#[Package('checkout')]
class LicenseService
{
    private StoreClient $client;

    public function __construct(StoreClient $client)
    {
        $this->client = $client;
    }

    public function createCart(int|string $extensionId, int|string $variantId, Context $context): CartStruct
    {
        $cart = $this->client->createCart($extensionId, $variantId, $context);

        return $this->ensureCartStruct($cart);
    }

    public function orderCart(CartStruct $cart, Context $context): void
    {
        $this->client->orderCart($cart, $context);
    }

    /**
     * @return list<PaymentMethod>
     */
    public function availablePaymentMeans(Context $context): array
    {
        return $this->client->availablePaymentMeans($context);
    }

    protected function ensureCartStruct(CartStruct $cart): CartStruct
    {
        // Ensure float precision
        $cart->setGrossPrice(FloatComparator::cast($cart->getGrossPrice()));
        $cart->setNetPrice(FloatComparator::cast($cart->getNetPrice()));
        $cart->setTaxValue(FloatComparator::cast($cart->getTaxValue()));
        $cart->setTaxRate(FloatComparator::cast($cart->getTaxRate()));

        /** @var CartPositionStruct $position */
        foreach ($cart->getPositions() as $position) {
            // Ensure float precision per position
            $position->setGrossPrice(FloatComparator::cast($position->getGrossPrice()));
            $position->setNetPrice(FloatComparator::cast($position->getNetPrice()));
            $position->setPseudoPrice(FloatComparator::cast($position->getPseudoPrice()));
            $position->setTaxValue(FloatComparator::cast($position->getTaxValue()));

            // Ensure extension information is initialized correctly
            $extensionInformation = $position->getExtensionInformation();

            if (isset($extensionInformation['permissions'])) {
                $permissions = new PermissionCollection($extensionInformation['permissions']);
                $extensionInformation['permissions'] = $permissions->getCategorizedPermissions();
            }

            $position->setExtensionInformation($extensionInformation);
        }

        return $cart;
    }
}
