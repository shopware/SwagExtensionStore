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
 * @phpstan-type InAppPurchaseCartPosition array{feature: InAppPurchase, priceModel: InAppPurchasePriceModel, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}
 */
#[Package('checkout')]
class InAppPurchaseCartPositionStruct extends Struct
{
    private function __construct(
        protected InAppPurchaseStruct $feature,
        protected InAppPurchasePriceModelStruct $priceModel,
        protected float $netPrice = 0.0,
        protected float $grossPrice = 0.0,
        protected float $taxRate = 0.0,
        protected float $taxValue = 0.0,
    ) {}

    /**
     * @param InAppPurchaseCartPosition $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            feature: InAppPurchaseStruct::fromArray($data['feature']),
            priceModel: InAppPurchasePriceModelStruct::fromArray($data['priceModel']),
        );
    }

    public function getFeature(): InAppPurchaseStruct
    {
        return $this->feature;
    }

    public function setFeature(InAppPurchaseStruct $feature): void
    {
        $this->feature = $feature;
    }

    public function getPriceModel(): InAppPurchasePriceModelStruct
    {
        return $this->priceModel;
    }

    public function setPriceModel(InAppPurchasePriceModelStruct $priceModel): void
    {
        $this->priceModel = $priceModel;
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
}
