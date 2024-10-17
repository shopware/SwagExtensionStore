<?php

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;

/**
 * @internal
 */
#[Package('checkout')]
interface InAppPurchaseIdentifiableStruct
{
    public function getIdentifier(): string;
}
