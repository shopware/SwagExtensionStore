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
        $data = json_decode($exception->getResponse()->getBody()->getContents(), true);

        parent::__construct($exception);

        $this->apiCode = $data['code'] ?? '';
    }

    public function getErrors(bool $withTrace = false): \Generator
    {
        $errors = parent::getErrors($withTrace);

        foreach ($errors as $error) {
            yield [
                ...$error,
                'apiCode' => $this->apiCode,
            ];
        }
    }
}
