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

    protected function getExpectedClass(): ?string
    {
        return InAppPurchaseCartPositionStruct::class;
    }
}
