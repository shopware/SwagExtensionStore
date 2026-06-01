<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\StoreApiException;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionStruct;

/**
 * @phpstan-import-type InAppPurchaseCartItem from InAppPurchaseCartPositionStruct
 */
class StoreClientTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    private Context $context;

    private StoreClient $storeClient;

    protected function setUp(): void
    {
        $this->context = Context::createDefaultContext();
        $this->storeClient = static::getContainer()->get(StoreClient::class);
    }

    public function testCreateCart(): void
    {
        $this->setUpCreateCartRequestHandler();

        $cart = $this->storeClient->createCart(12089, 79190, $this->context);

        static::assertSame(2577.52, $cart->getGrossPrice());
        static::assertCount(1, $cart->getPositions());
    }

    public function testCreateCartException(): void
    {
        $this->setUpCreateCartRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->createCart(69, 1337, $this->context);
    }

    public function testOrderCart(): void
    {
        $this->setUpExtensionRequestHandler(201);

        try {
            $this->storeClient->orderCart(new CartStruct(), $this->context);
        } catch (\Throwable $exception) {
            static::fail('Expected no exception to be thrown, got: ' . $exception->getMessage());
        }
    }

    public function testOrderCartException(): void
    {
        $this->setUpExtensionRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->orderCart(new CartStruct(), $this->context);
    }

    public function testAvailablePaymentMeans(): void
    {
        $this->setUpAvailablePaymentMeansRequestHandler();

        $paymentMeans = $this->storeClient->availablePaymentMeans($this->context);

        static::assertIsArray($paymentMeans);
        static::assertCount(2, $paymentMeans);
    }

    public function testAvailablePaymentMeansException(): void
    {
        $this->setUpAvailablePaymentMeansRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->availablePaymentMeans($this->context);
    }

    public function testCreateInAppPurchaseCartException(): void
    {
        $this->setUpIapRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->createInAppPurchaseCart('testExtension', 'testFeature', 'monthly', $this->context);
    }

    public function testOrderInAppPurchaseCartException(): void
    {
        $this->setUpIapRequestHandler(400);

        $this->expectException(StoreApiException::class);

        $this->storeClient->orderInAppPurchaseCart(19, $this->buildPositions(), $this->context);
    }

    public function testListInAppPurchasesException(): void
    {
        $this->setUpIapListingRequestHandler(400);

        $this->expectException(StoreApiException::class);
        $this->storeClient->listInAppPurchases('TestApp', $this->context);
    }

    public function testListInAppPurchasesBuildsStruct(): void
    {
        $this->setUpIapListingRequestHandler();

        $iap = $this->storeClient->listInAppPurchases('TestApp', $this->context);

        static::assertCount(2, $iap);
    }

    private function setUpExtensionRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->append(new Response($statusCode, []));
    }

    private function setUpCreateCartRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        if ($statusCode === 200) {
            $cartJson = file_get_contents(__DIR__ . '/../_fixtures/responses/example-cart.json');
            static::assertIsString($cartJson);
            $requestHandler->append(new Response($statusCode, [], $cartJson));

            return;
        }
        $requestHandler->append(new Response($statusCode, []));
    }

    private function setUpAvailablePaymentMeansRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        if ($statusCode === 200) {
            $json = file_get_contents(__DIR__ . '/../_fixtures/responses/payment-means.json');
            static::assertIsString($json);
            $requestHandler->append(new Response($statusCode, [], $json));

            return;
        }
        $requestHandler->append(new Response($statusCode, []));
    }

    private function setUpIapRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        $requestHandler->append(new Response($statusCode, []));
    }

    private function setUpIapListingRequestHandler(int $statusCode = 200): void
    {
        $requestHandler = $this->getStoreRequestHandler();
        if ($statusCode === 200) {
            $iapJson = file_get_contents(__DIR__ . '/../_fixtures/responses/extension-iap.json');
            static::assertIsString($iapJson);
            $requestHandler->append(new Response($statusCode, [], $iapJson));

            return;
        }
        $requestHandler->append(new Response($statusCode, []));
    }

    /**
     * @return array<int, InAppPurchaseCartItem>
     */
    private function buildPositions(): array
    {
        return [
            [
                'extensionName' => 'testExtension',
                'inAppFeatureIdentifier' => 'some-app-and-feature-name',
                'netPrice' => 9.99,
                'taxValue' => 1.90,
                'grossPrice' => 11.89,
                'taxRate' => 19.0,
                'variant' => 'monthly',
            ],
        ];
    }
}
