<?php declare(strict_types=1);

namespace SwagExtensionStore\Exception;

use Shopware\Core\Framework\ShopwareHttpException;
use Symfony\Component\HttpFoundation\Response;

class InvalidExtensionCartException extends ShopwareHttpException
{
    public function __construct()
    {
        parent::__construct(
            'The cart data is invalid.',
        );
    }

    public function getErrorCode(): string
    {
        return 'FRAMEWORK__INVALID_EXTENSION_CART';
    }

    public function getStatusCode(): int
    {
        return Response::HTTP_BAD_REQUEST;
    }
}
