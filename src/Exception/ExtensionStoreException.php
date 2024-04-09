<?php

declare(strict_types=1);

namespace SwagExtensionStore\Exception;

use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\HttpException;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Symfony\Component\HttpFoundation\Response;

#[Package('checkout')]
class ExtensionStoreException extends HttpException
{
    public static function createStoreApiExceptionFromClientError(ClientException $clientException): StoreApiException
    {
        return new StoreApiException($clientException);
    }

    public static function invalidExtensionId(): InvalidExtensionIdException
    {
        return new InvalidExtensionIdException();
    }

    public static function invalidVariantId(): InvalidVariantIdException
    {
        return new InvalidVariantIdException();
    }

    public static function invalidExtensionCart(string $errorMessage): self
    {
        return new self(
            Response::HTTP_BAD_REQUEST,
            'FRAMEWORK__INVALID_EXTENSION_CART',
            'The cart data is invalid: {{ errorMessage }}',
            ['errorMessage' => $errorMessage],
        );
    }
}
