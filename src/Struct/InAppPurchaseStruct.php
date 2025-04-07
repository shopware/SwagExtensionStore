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
 * @phpstan-type InAppPurchase array{identifier: string, name: string, description: string|null, priceModels: InAppPurchasePriceModel[]}
 */
#[Package('checkout')]
class InAppPurchaseStruct extends Struct
{
    private function __construct(
        protected InAppPurchasePriceModelCollection $priceModels,
        protected InAppPurchaseStatus $status = InAppPurchaseStatus::INACTIVE,
        protected string $identifier = '',
        protected string $name = '',
        protected ?string $description = null,
        protected ?string $serviceConditions = null,
        protected ?string $websiteGtc = null,
    ) {
    }

    /**
     * @param InAppPurchase $data
     */
    public static function fromArray(array $data): self
    {
        $data['status'] = InAppPurchaseStatus::tryFrom($data['status'] ?? 'inactive');

        return (new self(InAppPurchasePriceModelCollection::fromArray($data['priceModels'])))->assign($data);
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

    public function setPriceModels(InAppPurchasePriceModelCollection $priceModels): void
    {
        $this->priceModels = $priceModels;
    }

    public function addPriceModel(InAppPurchasePriceModelStruct $priceModel): void
    {
        $this->priceModels->add($priceModel);
    }

    public function getServiceConditions(): ?string
    {
        return $this->serviceConditions;
    }

    public function setServiceConditions(?string $serviceConditions): void
    {
        $this->serviceConditions = $serviceConditions;
    }

    public function getWebsiteGtc(): ?string
    {
        return $this->websiteGtc;
    }

    public function setWebsiteGtc(?string $websiteGtc): void
    {
        $this->websiteGtc = $websiteGtc;
    }

    public function getStatus(): InAppPurchaseStatus
    {
        return $this->status;
    }

    public function setStatus(InAppPurchaseStatus $status): void
    {
        $this->status = $status;
    }
}
