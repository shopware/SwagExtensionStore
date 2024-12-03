<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Collection;

/**
 * @codeCoverageIgnore
 *
 * @template-extends Collection<InAppPurchaseCartPositionStruct>
 *
 * @phpstan-import-type InAppPurchaseCartPosition from InAppPurchaseCartPositionStruct
 */
#[Package('checkout')]
class InAppPurchaseCartPositionCollection extends Collection
{
    /**
     * @param InAppPurchaseCartPosition[] $data
     */
    public static function fromArray(array $data): self
    {
        $elements = \array_map(static fn (array $element) => InAppPurchaseCartPositionStruct::fromArray($element), $data);

        return new self($elements);
    }

    /**
     * @return array<int, InAppPurchaseCartPosition>
     */
    public function toCart(): array
    {
        return array_map(static function (InAppPurchaseCartPositionStruct $position) {
            return $position->toCart();
        }, $this->elements); // @phpstan-ignore-line property.deprecated will be strictly typed. Remove this ignore for shopware v6.7.0
    }

    /**
     * @return array<int, string>
     */
    public function getIdentifiers(): array
    {
        return $this->map(static fn (InAppPurchaseCartPositionStruct $element) => $element->getInAppFeatureIdentifier());
    }

    /**
     * @param array<int, string> $validPurchases
     */
    public function filterValidInAppPurchases(
        InAppPurchaseCartPositionCollection $allPurchases,
        array $validPurchases,
    ): self {
        return $allPurchases->filter(function (InAppPurchaseCartPositionStruct $purchase) use ($validPurchases) {
            return \in_array($purchase->getInAppFeatureIdentifier(), $validPurchases, true);
        });
    }

    protected function getExpectedClass(): string
    {
        return InAppPurchaseCartPositionStruct::class;
    }
}
