<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Api;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Controller\BasketController;
use SwagExtensionStore\Services\BasketService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class BasketControllerTest extends TestCase
{
    use IntegrationTestBehaviour;

    public function setUp(): void
    {
        Feature::skipTestIfInActive('FEATURE_NEXT_12608', $this);
        parent::setUp();
    }

    public function testPurchaseExtensionWithInvalidExtensionId(): void
    {
        $provider = $this->createMock(BasketService::class);

        $controller = new BasketController($provider);

        $request = new Request();
        $request->request->set('extensionId', 'foo');

        static::expectException(InvalidExtensionIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtensionWithInvalidVariantId(): void
    {
        $provider = $this->createMock(BasketService::class);

        $controller = new BasketController($provider);

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 'foo');

        static::expectException(InvalidVariantIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtension(): void
    {
        $provider = $this->createMock(BasketService::class);

        $controller = new BasketController($provider);

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 1);

        $response = $controller->createCart($request, Context::createDefaultContext());

        static::assertEquals(Response::HTTP_OK, $response->getStatusCode());
    }

    public function testAvailablePaymentMeans(): void
    {
        $service = $this->createMock(BasketService::class);
        $service->expects(self::once())
            ->method('availablePaymentMeans')
            ->willReturn(['payment-mean-1', 'payment-mean-2']);

        $controller = new BasketController($service);

        $response = $controller->availablePaymentMeans(Context::createDefaultContext());

        static::assertEquals(Response::HTTP_OK, $response->getStatusCode());
        static::assertEquals(json_encode(['payment-mean-1', 'payment-mean-2']), $response->getContent());
    }

    public function testOrderCart(): void
    {
        $context = Context::createDefaultContext();
        $requestDataBag = new RequestDataBag([
            'positions' => [],
        ]);

        $service = $this->createMock(BasketService::class);
        $service->expects(self::once())
            ->method('orderCart');

        $controller = new BasketController($service);

        $response = $controller->orderCart($requestDataBag, $context);

        static::assertEquals(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        static::assertEmpty($response->getContent());
    }
}
