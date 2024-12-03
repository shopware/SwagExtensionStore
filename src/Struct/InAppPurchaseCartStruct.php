<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchaseCartPosition from InAppPurchaseCartPositionStruct
 *
 * @phpstan-type Shop array{id: int, domain: string}|array{}
 * @phpstan-type InAppPurchaseCart array{positions: InAppPurchaseCartPosition[], bookingShop: Shop, licenseShop: Shop, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}
 */
#[Package('checkout')]
class InAppPurchaseCartStruct extends Struct
{
    /**
     * @param Shop $bookingShop
     * @param Shop $licenseShop
     */
    private function __construct(
        protected InAppPurchaseCartPositionCollection $positions,
        protected array $bookingShop = [],
        protected array $licenseShop = [],
        protected float $netPrice = 0.0,
        protected float $grossPrice = 0.0,
        protected float $taxRate = 0.0,
        protected float $taxValue = 0.0,
    ) {
    }

    /**
     * @param InAppPurchaseCart $data
     */
    public static function fromArray(array $data): self
    {
        return (new self(InAppPurchaseCartPositionCollection::fromArray($data['positions'])))->assign($data);
    }

    /**
     * @return Shop
     */
    public function getBookingShop(): array
    {
        return $this->bookingShop;
    }

    /**
     * @param Shop $bookingShop
     */
    public function setBookingShop(array $bookingShop): void
    {
        $this->bookingShop = $bookingShop;
    }

    /**
     * @return Shop
     */
    public function getLicenseShop(): array
    {
        return $this->licenseShop;
    }

    /**
     * @param Shop $licenseShop
     */
    public function setLicenseShop(array $licenseShop): void
    {
        $this->licenseShop = $licenseShop;
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

    public function getPositions(): InAppPurchaseCartPositionCollection
    {
        return $this->positions;
    }

    public function setPositions(InAppPurchaseCartPositionCollection $positions): void
    {
        $this->positions = $positions;
    }
}
