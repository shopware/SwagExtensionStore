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
        $elements = \array_map(static fn(array $element) => InAppPurchaseCartPositionStruct::fromArray($element), $data);

        return new self($elements);
    }

    /**
     * @return array<int, array{inAppFeatureIdentifier: string, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}>
     */
    public function toCart(): array
    {
        return array_map(static function (InAppPurchaseCartPositionStruct $position) {
            return $position->toCart();
        }, $this->elements);
    }

    protected function getExpectedClass(): ?string
    {
        return InAppPurchaseCartPositionStruct::class;
    }

    /**
     * @return array<int, string>
     */
    public function getIdentifiers(): array
    {
        return $this->map(static fn(InAppPurchaseCartPositionStruct $element) => $element->getInAppFeatureIdentifier());
    }

    /**
     * @param array<int, string> $validPurchases
     */
    public function filterValidInAppPurchases(
        InAppPurchaseCartPositionCollection $allPurchases,
        array $validPurchases,
    ): self {
        return $allPurchases->filter(function (InAppPurchaseCartPositionStruct $purchase) use ($validPurchases) {
            return \in_array($purchase->getInAppFeatureIdentifier(), $validPurchases);
        });
    }
}
