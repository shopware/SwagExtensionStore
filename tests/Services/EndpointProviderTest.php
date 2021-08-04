<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use OutOfBoundsException;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\EndpointProvider;

class EndpointProviderTest extends TestCase
{
    use IntegrationTestBehaviour;

    private EndpointProvider $endpointProvider;

    public function setUp(): void
    {
        $this->endpointProvider = $this->getContainer()->get(EndpointProvider::class);
    }

    public function testCanGetAvailableEndpoints(): void
    {
        $actual = $this->getContainer()->getParameter('swag_extension_store.endpoints');
        $expected = $this->provideAvailableEndpoints();

        static::assertSame($expected, $actual);
    }

    public function testThrowsExceptionIfEndpointIsNotAvailable()
    {
        static::expectException(OutOfBoundsException::class);
        static::expectExceptionMessage('Store endpoint "foo_bar" not found');

        $this->endpointProvider->get('foo_bar');
    }

    public function provideAvailableEndpoints(): array
    {
        return [
            "categories" => "/swplatform/extensionstore/categories",
            "list_extensions" => "/swplatform/extensionstore/extensions",
            "extension_detail" => "/swplatform/extensionstore/extensions/%d",
            "filter" => "/swplatform/extensionstore/extensions/filter",
            "reviews" => "/swplatform/extensionstore/extensions/%d/reviews",
            "create_basket" => "/swplatform/extensionstore/baskets",
            "order_basket" => "/swplatform/extensionstore/orders",
            "payment_means" => "/swplatform/extensionstore/paymentmeans",
        ];
    }
}
