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
        $elements = \array_map(static fn(array $element) => InAppPurchaseStruct::fromArray($element), $data);

        return new self($elements);
    }
}
