<?php

declare(strict_types=1);

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Struct\CartStruct;
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

    public function createCart(int $extensionId, int $variantId, Context $context): CartStruct
    {
        $cart = $this->client->createCart($extensionId, $variantId, $context);

        return $this->ensureFloatPrecision($cart);
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

    protected function ensureFloatPrecision(CartStruct $cart): CartStruct
    {
        $cart->setGrossPrice(FloatComparator::cast($cart->getGrossPrice()));
        $cart->setNetPrice(FloatComparator::cast($cart->getNetPrice()));
        $cart->setTaxValue(FloatComparator::cast($cart->getTaxValue()));
        $cart->setTaxRate(FloatComparator::cast($cart->getTaxRate()));

        foreach ($cart->getPositions() as $position) {
            $position->setGrossPrice(FloatComparator::cast($position->getGrossPrice()));
            $position->setNetPrice(FloatComparator::cast($position->getNetPrice()));
            $position->setPseudoPrice(FloatComparator::cast($position->getPseudoPrice()));
            $position->setTaxValue(FloatComparator::cast($position->getTaxValue()));
        }

        return $cart;
    }
}
