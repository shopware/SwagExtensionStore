<?php declare(strict_types=1);

namespace SwagExtensionStore\Exception;

use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Exception\StoreApiException;

#[Package('checkout')]
class ExtensionStoreApiException extends StoreApiException
{
    protected string $apiCode;

    public function __construct(ClientException $exception)
    {
        parent::__construct($exception);

        try {
            $data = json_decode($exception->getResponse()->getBody()->getContents(), true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
        }
        $this->apiCode = $data['code'] ?? '';
    }

    public function getErrors(bool $withTrace = false): \Generator
    {
        foreach (parent::getErrors($withTrace) as $error) {
            /** @phpstan-ignore generator.valueType (Parent class defines a sealed array as return type. Might not be worth it, to widen it in core) */
            yield [
                ...$error,
                'apiCode' => $this->apiCode,
            ];
        }
    }
}
