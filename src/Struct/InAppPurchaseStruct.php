<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchasePriceModel from InAppPurchasePriceModelStruct
 *
 * @phpstan-type InAppPurchase array{identifier: string, name: string, description: string|null, priceModel: InAppPurchasePriceModel}
 */
#[Package('checkout')]
class InAppPurchaseStruct extends Struct
{
    private function __construct(
        protected InAppPurchasePriceModelStruct $priceModel,
        protected string $identifier = '',
        protected string $name = '',
        protected ?string $description = null,
    ) {
    }

    /**
     * @param InAppPurchase $data
     */
    public static function fromArray(array $data): self
    {
        return (new self(InAppPurchasePriceModelStruct::fromArray($data['priceModel'])))->assign($data);
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    public function setIdentifier(string $identifier): void
    {
        $this->identifier = $identifier;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getPriceModel(): InAppPurchasePriceModelStruct
    {
        return $this->priceModel;
    }

    public function setPriceModals(InAppPurchasePriceModelStruct $priceModel): void
    {
        $this->priceModel = $priceModel;
    }
}
