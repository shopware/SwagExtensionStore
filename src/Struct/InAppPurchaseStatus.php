<?php declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;

#[Package('checkout')]
enum InAppPurchaseStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
}
