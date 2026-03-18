<?php declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchase from InAppPurchaseStruct
 * @phpstan-import-type InAppPurchasePendingDowngrade from InAppPurchasePendingDowngradeStruct
 *
 * @phpstan-type InAppPurchaseSubscriptionChange array{currentFeature: InAppPurchase, type: string, currentFeatureVariant: string, currentNetPrice: float, pendingDowngrade: InAppPurchasePendingDowngrade|null, isIncludedInPluginLicense: bool}
 */
#[Package('checkout')]
class InAppPurchaseSubscriptionChangeStruct extends Struct
{
    private function __construct(
        protected InAppPurchaseStruct $currentFeature,
        protected ?InAppPurchasePendingDowngradeStruct $pendingDowngrade = null,
        protected string $type = '',
        protected string $currentFeatureVariant = '',
        protected float $currentNetPrice = 0.0,
        protected bool $isIncludedInPluginLicense = false,
    ) {
    }

    /**
     * @param InAppPurchaseSubscriptionChange $data
     */
    public static function fromArray(array $data): self
    {
        $currentFeature = InAppPurchaseStruct::fromArray($data['currentFeature']);
        $pendingDowngrade = isset($data['pendingDowngrade']) ? InAppPurchasePendingDowngradeStruct::fromArray($data['pendingDowngrade']) : null;

        return (new self($currentFeature, $pendingDowngrade))->assign($data);
    }

    /**
     * @return array{type: string, currentInAppFeatureIdentifier: string}
     */
    public function toCart(): array
    {
        return [
            'type' => $this->getType(),
            'currentInAppFeatureIdentifier' => $this->getCurrentFeature()->getIdentifier(),
        ];
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getCurrentFeature(): InAppPurchaseStruct
    {
        return $this->currentFeature;
    }

    public function setCurrentFeature(InAppPurchaseStruct $currentFeature): void
    {
        $this->currentFeature = $currentFeature;
    }

    public function getCurrentFeatureVariant(): string
    {
        return $this->currentFeatureVariant;
    }

    public function setCurrentFeatureVariant(string $currentFeatureVariant): void
    {
        $this->currentFeatureVariant = $currentFeatureVariant;
    }

    public function getCurrentNetPrice(): float
    {
        return $this->currentNetPrice;
    }

    public function setCurrentNetPrice(float $currentNetPrice): void
    {
        $this->currentNetPrice = $currentNetPrice;
    }

    public function getPendingDowngrade(): ?InAppPurchasePendingDowngradeStruct
    {
        return $this->pendingDowngrade;
    }

    public function setPendingDowngrade(?InAppPurchasePendingDowngradeStruct $pendingDowngrade): void
    {
        $this->pendingDowngrade = $pendingDowngrade;
    }

    public function isIncludedInPluginLicense(): bool
    {
        return $this->isIncludedInPluginLicense;
    }

    public function setIncludedInPluginLicense(bool $isIncludedInPluginLicense): void
    {
        $this->isIncludedInPluginLicense = $isIncludedInPluginLicense;
    }
}
