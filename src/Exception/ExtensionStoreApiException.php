<?php declare(strict_types=1);

namespace SwagExtensionStore\Exception;

use GuzzleHttp\Exception\ClientException;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Exception\StoreApiException;

#[Package('checkout')]
class ExtensionStoreApiException extends StoreApiException
{
    protected string $apiCode;

    protected string $description;

    public function __construct(ClientException $exception)
    {
        parent::__construct($exception);

        $data = $this->getData($exception);
        $this->apiCode = $data['code'] ?? '';
        $this->description = $data['description'] ?? '';
    }

    public function getErrors(bool $withTrace = false): \Generator
    {
        foreach (parent::getErrors($withTrace) as $error) {
            /** @phpstan-ignore generator.valueType (Parent class defines a sealed array as return type. Might not be worth it, to widen it in core) */
            yield [
                ...$error,
                'apiCode' => $this->apiCode,
                'description' => $this->description,
            ];
        }
    }

    /**
     * @return array<array-key, mixed>
     */
    private function getData(ClientException $exception): array
    {
        $body = $exception->getResponse()->getBody();

        // The parent constructor already read the body to its end and left the stream at EOF,
        // so reading it again without rewinding yields an empty string.
        if ($body->isSeekable()) {
            $body->rewind();
        }

        try {
            $data = json_decode($body->getContents(), true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return [];
        }

        // A body may be valid JSON without being an object, e.g. a bare string or number.
        return \is_array($data) ? $data : [];
    }
}
