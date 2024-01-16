<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Controller\LicenseController;
use SwagExtensionStore\Exception\ExtensionStoreException;
use SwagExtensionStore\Services\LicenseService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LicenseControllerTest extends TestCase
{
    public function testPurchaseExtensionWithInvalidExtensionId(): void
    {
        $controller = new LicenseController($this->createMock(LicenseService::class));

        $request = new Request();
        $request->request->set('extensionId', 'foo');

        $this->expectException(InvalidExtensionIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtensionWithInvalidVariantId(): void
    {
        $controller = new LicenseController($this->createMock(LicenseService::class));

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 'foo');

        $this->expectException(InvalidVariantIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtension(): void
    {
        $controller = new LicenseController($this->createMock(LicenseService::class));

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 1);

        $response = $controller->createCart($request, Context::createDefaultContext());

        static::assertSame(Response::HTTP_OK, $response->getStatusCode());
    }

    public function testAvailablePaymentMeans(): void
    {
        $service = $this->createMock(LicenseService::class);
        $service->expects(static::once())
            ->method('availablePaymentMeans')
            ->willReturn(['payment-mean-1', 'payment-mean-2']);

        $response = (new LicenseController($service))->availablePaymentMeans(Context::createDefaultContext());

        static::assertSame(Response::HTTP_OK, $response->getStatusCode());
        static::assertSame(json_encode(['payment-mean-1', 'payment-mean-2']), $response->getContent());
    }

    public function testOrderCart(): void
    {
        $requestDataBag = new RequestDataBag([
            'positions' => [],
        ]);

        $service = $this->createMock(LicenseService::class);
        $service->expects(static::once())
            ->method('orderCart');

        $response = (new LicenseController($service))->orderCart($requestDataBag, Context::createDefaultContext());

        static::assertSame(Response::HTTP_NO_CONTENT, $response->getStatusCode());
        static::assertEmpty($response->getContent());
    }

    public function testOrderCartWithEmptyRequestDataBag(): void
    {
        $requestDataBag = new RequestDataBag([
            'positions' => null,
        ]);

        $controller = new LicenseController($this->createMock(LicenseService::class));

        $this->expectException(ExtensionStoreException::class);
        $this->expectExceptionMessageMatches('/The cart data is invalid: Shopware\\\\Core\\\\Framework\\\\Store\\\\Struct\\\\CartPositionCollection::__construct(): Argument #1 ($elements) must be of type Traversable|array, null given, called in/');
        $controller->orderCart($requestDataBag, Context::createDefaultContext());
    }
}
