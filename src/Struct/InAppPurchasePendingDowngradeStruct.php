<?php declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchase from InAppPurchaseStruct
 *
 * @phpstan-type InAppPurchasePendingDowngrade array{feature: InAppPurchase, netPrice: float}
 */
#[Package('checkout')]
class InAppPurchasePendingDowngradeStruct extends Struct
{
    private function __construct(
        protected InAppPurchaseStruct $feature,
        protected float $netPrice = 0.0,
    ) {
    }

    /**
     * @param InAppPurchasePendingDowngrade $data
     */
    public static function fromArray(array $data): self
    {
        $feature = InAppPurchaseStruct::fromArray($data['feature']);

        return (new self($feature))->assign($data);
    }

    public function getFeature(): InAppPurchaseStruct
    {
        return $this->feature;
    }

    public function setFeature(InAppPurchaseStruct $feature): void
    {
        $this->feature = $feature;
    }

    public function getNetPrice(): float
    {
        return $this->netPrice;
    }

    public function setNetPrice(float $netPrice): void
    {
        $this->netPrice = $netPrice;
    }
}
