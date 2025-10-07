<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchase from InAppPurchaseStruct
 * @phpstan-import-type InAppPurchasePriceModel from InAppPurchasePriceModelStruct
 * @phpstan-import-type InAppPurchaseSubscriptionChange from InAppPurchaseSubscriptionChangeStruct
 *
 * @phpstan-type InAppPurchaseCartPosition array{subscriptionChange?: InAppPurchaseSubscriptionChange, extensionName: string, inAppFeatureIdentifier: string, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}
 * @phpstan-type InAppPurchaseCartItem array{extensionName: string, inAppFeatureIdentifier: string, netPrice: float, taxValue: float, grossPrice: float, taxRate: float, variant: string, subscriptionChange?: array{type: string, currentInAppFeatureIdentifier: string}}
 */
#[Package('checkout')]
class InAppPurchaseCartPositionStruct extends Struct
{
    private function __construct(
        protected ?InAppPurchaseSubscriptionChangeStruct $subscriptionChange,
        protected string $extensionName = '',
        protected string $inAppFeatureIdentifier = '',
        protected float $netPrice = 0.0,
        protected float $grossPrice = 0.0,
        protected float $taxRate = 0.0,
        protected float $taxValue = 0.0,
        protected float $proratedNetPrice = 0.0,
        protected string $variant = '',
    ) {
    }

    /**
     * @param InAppPurchaseCartPosition $data
     */
    public static function fromArray(array $data): self
    {
        $subscriptionChange = null;

        if (!empty($data['subscriptionChange'])) {
            $subscriptionChange = InAppPurchaseSubscriptionChangeStruct::fromArray($data['subscriptionChange']);
        }

        $inAppPurchaseCartPosition = (new self($subscriptionChange))->assign($data);
        if ($inAppPurchaseCartPosition->getInAppFeatureIdentifier() === '') {
            $inAppPurchaseCartPosition->setInAppFeatureIdentifier($data['feature']['identifier'] ?? '');
        }

        return $inAppPurchaseCartPosition;
    }

    /**
     * @return InAppPurchaseCartItem
     */
    public function toCart(): array
    {
        $data = [
            'extensionName' => $this->getExtensionName(),
            'inAppFeatureIdentifier' => $this->getInAppFeatureIdentifier(),
            'netPrice' => $this->getNetPrice(),
            'taxValue' => $this->getTaxValue(),
            'grossPrice' => $this->getGrossPrice(),
            'taxRate' => $this->getTaxRate(),
            'variant' => $this->getVariant(),
        ];

        if ($this->subscriptionChange) {
            $data['subscriptionChange'] = $this->subscriptionChange->toCart();
        }

        return $data;
    }

    public function getInAppFeatureIdentifier(): string
    {
        return $this->inAppFeatureIdentifier;
    }

    public function setInAppFeatureIdentifier(string $inAppFeatureIdentifier): void
    {
        $this->inAppFeatureIdentifier = $inAppFeatureIdentifier;
    }

    public function getNetPrice(): float
    {
        return $this->netPrice;
    }

    public function setNetPrice(float $netPrice): void
    {
        $this->netPrice = $netPrice;
    }

    public function getGrossPrice(): float
    {
        return $this->grossPrice;
    }

    public function setGrossPrice(float $grossPrice): void
    {
        $this->grossPrice = $grossPrice;
    }

    public function getTaxRate(): float
    {
        return $this->taxRate;
    }

    public function setTaxRate(float $taxRate): void
    {
        $this->taxRate = $taxRate;
    }

    public function getTaxValue(): float
    {
        return $this->taxValue;
    }

    public function setTaxValue(float $taxValue): void
    {
        $this->taxValue = $taxValue;
    }

    public function getExtensionName(): string
    {
        return $this->extensionName;
    }

    public function setExtensionName(string $name): void
    {
        $this->extensionName = $name;
    }

    public function getProratedNetPrice(): float
    {
        return $this->proratedNetPrice;
    }

    public function setProratedNetPrice(float $proratedNetPrice): void
    {
        $this->proratedNetPrice = $proratedNetPrice;
    }

    public function getVariant(): string
    {
        return $this->variant;
    }

    public function setVariant(string $variant): void
    {
        $this->variant = $variant;
    }
}
