<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Exception;

use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7\NoSeekStream;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\Utils;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Exception\ExtensionStoreApiException;

#[Package('checkout')]
class ExtensionStoreApiExceptionTest extends TestCase
{
    public function testErrorExposesTheCompleteStoreApiErrorBody(): void
    {
        $exception = new ExtensionStoreApiException($this->createClientException((string) json_encode([
            'code' => 'STORE__EXTENSION_NOT_PURCHASABLE',
            'title' => 'Extension cannot be purchased',
            'description' => 'The extension is not available for your shop.',
            'documentationLink' => 'https://docs.shopware.com/store-error',
        ], \JSON_THROW_ON_ERROR)));

        $error = $this->firstError($exception);

        static::assertSame('STORE__EXTENSION_NOT_PURCHASABLE', $error['apiCode']);
        static::assertSame('Extension cannot be purchased', $error['title']);
        static::assertSame('The extension is not available for your shop.', $error['description']);
        static::assertSame('The extension is not available for your shop.', $error['detail']);
        static::assertIsArray($error['meta']);
        static::assertSame('https://docs.shopware.com/store-error', $error['meta']['documentationLink']);
    }

    #[DataProvider('unusableBodyProvider')]
    public function testErrorFallsBackToEmptyValuesOnAnUnusableBody(string $body): void
    {
        $exception = new ExtensionStoreApiException($this->createClientException($body));

        $error = $this->firstError($exception);

        static::assertSame('', $error['apiCode']);
        static::assertSame('', $error['title']);
        static::assertSame('', $error['description']);
        static::assertSame('Store is not reachable', $error['detail']);
        static::assertIsArray($error['meta']);
        static::assertSame('', $error['meta']['documentationLink']);
    }

    /**
     * @return \Generator<string, array{string}>
     */
    public static function unusableBodyProvider(): \Generator
    {
        yield 'gateway returns an html error page instead of json' => ['<html>gateway timeout</html>'];
        yield 'response has no body at all' => [''];
        yield 'body is valid json but decodes to a string' => ['"just a string"'];
        yield 'body is valid json but decodes to a number' => ['42'];
        yield 'body is valid json but decodes to null' => ['null'];
        yield 'body is a json list instead of an error object' => ['[1, 2, 3]'];
    }

    public function testErrorKeepsTheFieldsTheParentParsedWhenTheBodyCannotBeReadTwice(): void
    {
        $body = new NoSeekStream(Utils::streamFor((string) json_encode([
            'code' => 'STORE__EXTENSION_NOT_PURCHASABLE',
            'title' => 'Extension cannot be purchased',
            'description' => 'The extension is not available for your shop.',
            'documentationLink' => 'https://docs.shopware.com/store-error',
        ], \JSON_THROW_ON_ERROR)));

        $exception = new ExtensionStoreApiException(new ClientException(
            'Store is not reachable',
            new Request('GET', '/swplatform/extensionstore/baskets'),
            new Response(400, [], $body),
        ));

        $error = $this->firstError($exception);

        static::assertSame('Extension cannot be purchased', $error['title']);
        static::assertIsArray($error['meta']);
        static::assertSame('https://docs.shopware.com/store-error', $error['meta']['documentationLink']);
        static::assertSame('The extension is not available for your shop.', $error['detail']);
        static::assertSame('', $error['apiCode']);
        static::assertSame('', $error['description']);
    }

    /**
     * The parent declares a sealed error shape, so the extra fields this exception adds are invisible
     * to static analysis when read straight off the generator.
     *
     * @return array<string, mixed>
     */
    private function firstError(ExtensionStoreApiException $exception): array
    {
        return $exception->getErrors()->current();
    }

    private function createClientException(string $body): ClientException
    {
        return new ClientException(
            'Store is not reachable',
            new Request('GET', '/swplatform/extensionstore/baskets'),
            new Response(400, [], $body),
        );
    }
}
