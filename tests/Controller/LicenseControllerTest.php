<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Api;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Controller\LicenseController;
use SwagExtensionStore\Exception\InvalidExtensionCartException;
use SwagExtensionStore\Services\LicenseService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LicenseControllerTest extends TestCase
{
    public function testPurchaseExtensionWithInvalidExtensionId(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new LicenseController($provider);

        $request = new Request();
        $request->request->set('extensionId', 'foo');

        static::expectException(InvalidExtensionIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtensionWithInvalidVariantId(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new LicenseController($provider);

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 'foo');

        static::expectException(InvalidVariantIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtension(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new LicenseController($provider);

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 1);

        $response = $controller->createCart($request, Context::createDefaultContext());

        static::assertEquals(Response::HTTP_OK, $response->getStatusCode());
    }

    public function testAvailablePaymentMeans(): void
    {
        $service = $this->createMock(LicenseService::class);
        $service->expects(static::once())
            ->method('availablePaymentMeans')
            ->willReturn(['payment-mean-1', 'payment-mean-2']);

        $controller = new LicenseController($service);

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

        $service = $this->createMock(LicenseService::class);
        $service->expects(static::once())
            ->method('orderCart');

        $controller = new LicenseController($service);

        $response = $controller->orderCart($requestDataBag, $context);

        static::assertEquals(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        static::assertEmpty($response->getContent());
    }

    public function testOrderCartWithEmptyRequestDataBag(): void
    {
        $context = Context::createDefaultContext();
        $requestDataBag = new RequestDataBag([
            'positions' => null,
        ]);

        $service = $this->createMock(LicenseService::class);

        $controller = new LicenseController($service);

        static::expectException(InvalidExtensionCartException::class);
        $controller->orderCart($requestDataBag, $context);
    }
}
