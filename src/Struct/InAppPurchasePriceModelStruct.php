<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @codeCoverageIgnore
 *
 * @phpstan-type InAppPurchasePriceModel array{type: string, price: float, duration: int|null, oneTimeOnly: bool|null, conditionsType: string|null}
 */
#[Package('checkout')]
class InAppPurchasePriceModelStruct extends Struct
{
    private function __construct(
        protected string $variant = '',
        protected string $type = '',
        protected float $price = 0.0,
        protected ?int $duration = null,
        protected ?bool $oneTimeOnly = null,
        protected ?string $conditionsType = null,
    ) {
    }

    /**
     * @param InAppPurchasePriceModel $data
     */
    public static function fromArray(array $data): self
    {
        return (new self())->assign($data);
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): void
    {
        $this->type = $type;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): void
    {
        $this->price = $price;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(?int $duration): void
    {
        $this->duration = $duration;
    }

    public function isOneTimeOnly(): ?bool
    {
        return $this->oneTimeOnly;
    }

    public function setOneTimeOnly(?bool $oneTimeOnly): void
    {
        $this->oneTimeOnly = $oneTimeOnly;
    }

    public function getVariant(): string
    {
        return $this->variant;
    }

    public function setVariant(string $variant): void
    {
        $this->variant = $variant;
    }

    public function getConditionsType(): ?string
    {
        return $this->conditionsType;
    }

    public function setConditionsType(?string $conditionsType): void
    {
        $this->conditionsType = $conditionsType;
    }
}
