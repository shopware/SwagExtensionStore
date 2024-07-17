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
    protected InAppPurchaseStruct $feature;

    protected InAppPurchasePriceModelStruct $priceModel;

    protected float $netPrice;

    protected float $grossPrice;

    protected float $taxRate;

    protected float $taxValue;

    /**
     * @param InAppPurchaseCartPosition $data
     */
    public static function fromArray(array $data): self
    {
        $data['feature'] = InAppPurchaseStruct::fromArray($data['feature']);
        $data['priceModel'] = InAppPurchasePriceModelStruct::fromArray($data['priceModel']);

        return (new self())->assign($data);
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
