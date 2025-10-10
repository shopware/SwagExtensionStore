<?php declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchase from InAppPurchaseStruct
 *
 * @phpstan-type InAppPurchaseSubscriptionChange array{currentFeature: InAppPurchase, type: string, currentFeatureVariant: string, currentNetPrice: string, pendingDowngrade: string}
 */
#[Package('checkout')]
class InAppPurchaseSubscriptionChangeStruct extends Struct
{
    private function __construct(
        protected InAppPurchaseStruct $currentFeature,
        protected string $type = '',
        protected string $currentFeatureVariant = '',
        protected string $currentNetPrice = '',
        protected string $pendingDowngrade = '',
    ) {
    }

    /**
     * @param InAppPurchaseSubscriptionChange $data
     */
    public static function fromArray(array $data): self
    {
        return (new self(InAppPurchaseStruct::fromArray($data['currentFeature'])))->assign($data);
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

    public function getCurrentNetPrice(): string
    {
        return $this->currentNetPrice;
    }

    public function setCurrentNetPrice(string $currentNetPrice): void
    {
        $this->currentNetPrice = $currentNetPrice;
    }

    public function getPendingDowngrade(): string
    {
        return $this->pendingDowngrade;
    }

    public function setPendingDowngrade(string $pendingDowngrade): void
    {
        $this->pendingDowngrade = $pendingDowngrade;
    }
}
