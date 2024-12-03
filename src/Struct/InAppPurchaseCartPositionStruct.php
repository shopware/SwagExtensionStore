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
 *
 * @phpstan-type InAppPurchaseCartPosition array{extensionName: string, inAppFeatureIdentifier: string, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}
 */
#[Package('checkout')]
class InAppPurchaseCartPositionStruct extends Struct
{
    private function __construct(
        protected string $extensionName = '',
        protected string $inAppFeatureIdentifier = '',
        protected float $netPrice = 0.0,
        protected float $grossPrice = 0.0,
        protected float $taxRate = 0.0,
        protected float $taxValue = 0.0,
    ) {
    }

    /**
     * @param InAppPurchaseCartPosition $data
     */
    public static function fromArray(array $data): self
    {
        $inAppPurchaseCartPosition = (new self())->assign($data);
        if ($inAppPurchaseCartPosition->getInAppFeatureIdentifier() === '') {
            $inAppPurchaseCartPosition->setInAppFeatureIdentifier($data['feature']['identifier'] ?? '');
        }

        return $inAppPurchaseCartPosition;
    }

    /**
     * @return InAppPurchaseCartPosition
     */
    public function toCart(): array
    {
        return [
            'extensionName' => $this->getExtensionName(),
            'inAppFeatureIdentifier' => $this->getInAppFeatureIdentifier(),
            'netPrice' => $this->getNetPrice(),
            'taxValue' => $this->getTaxValue(),
            'grossPrice' => $this->getGrossPrice(),
            'taxRate' => $this->getTaxRate(),
        ];
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
}
