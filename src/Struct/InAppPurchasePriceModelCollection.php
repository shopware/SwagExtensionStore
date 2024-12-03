<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Collection;

/**
 * @codeCoverageIgnore
 *
 * @template-extends Collection<InAppPurchasePriceModelStruct>
 *
 * @phpstan-import-type InAppPurchasePriceModel from InAppPurchasePriceModelStruct
 */
#[Package('checkout')]
class InAppPurchasePriceModelCollection extends Collection
{
    /**
     * @param InAppPurchasePriceModel[] $data
     */
    public static function fromArray(array $data): self
    {
        $elements = \array_map(static fn (array $element) => InAppPurchasePriceModelStruct::fromArray($element), $data);

        return new self($elements);
    }

    protected function getExpectedClass(): ?string
    {
        return InAppPurchasePriceModelStruct::class;
    }
}
