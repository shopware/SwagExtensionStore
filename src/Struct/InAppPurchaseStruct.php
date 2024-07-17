<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-import-type InAppPurchasePriceModel from InAppPurchasePriceModelStruct
 * @phpstan-type InAppPurchase array{identifier: string, name: string, description: string|null, priceModels: InAppPurchasePriceModel[]}
 */
#[Package('checkout')]
class InAppPurchaseStruct extends Struct
{
    protected string $identifier;

    protected string $name;

    protected ?string $description = null;

    protected InAppPurchasePriceModelCollection $priceModels;

    /**
     * @param InAppPurchase $data
     */
    public static function fromArray(array $data): self
    {
        $data['priceModels'] = InAppPurchasePriceModelCollection::fromArray($data['priceModels']);

        return (new self())->assign($data);
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

    public function getPriceModels(): InAppPurchasePriceModelCollection
    {
        return $this->priceModels;
    }

    public function setPriceModals(InAppPurchasePriceModelCollection $priceModels): void
    {
        $this->priceModels = $priceModels;
    }
}
