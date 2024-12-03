<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Collection;

/**
 * @codeCoverageIgnore
 *
 * @template-extends Collection<InAppPurchaseStruct>
 *
 * @phpstan-import-type InAppPurchase from InAppPurchaseStruct
 */
#[Package('checkout')]
class InAppPurchaseCollection extends Collection
{
    /**
     * @param InAppPurchase[] $data
     */
    public static function fromArray(array $data): self
    {
        $elements = \array_map(static fn (array $element) => InAppPurchaseStruct::fromArray($element), $data);

        return new self($elements);
    }

    /**
     * @return array<int, string>
     */
    public function getIdentifiers(): array
    {
        return $this->map(static fn (InAppPurchaseStruct $element) => $element->getIdentifier());
    }

    /**
     * @param array<int, string> $validPurchases
     */
    public function filterValidInAppPurchases(
        InAppPurchaseCollection $allPurchases,
        array $validPurchases,
    ): InAppPurchaseCollection {
        return $allPurchases->filter(function (InAppPurchaseStruct $purchase) use ($validPurchases) {
            return \in_array($purchase->getIdentifier(), $validPurchases, true);
        });
    }
}
