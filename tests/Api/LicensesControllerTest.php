<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Api;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Controller\BasketController;
use SwagExtensionStore\Services\LicenseService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LicensesControllerTest extends TestCase
{
    use IntegrationTestBehaviour;

    public function setUp(): void
    {
        Feature::skipTestIfInActive('FEATURE_NEXT_12608', $this);
        parent::setUp();
    }

    public function testPurchaseExtensionWithInvalidExtensionId(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new BasketController(
            $provider
        );

        $request = new Request();
        $request->request->set('extensionId', 'foo');

        static::expectException(InvalidExtensionIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtensionWithInvalidVariantId(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new BasketController(
            $provider
        );

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 'foo');

        static::expectException(InvalidVariantIdException::class);
        $controller->createCart($request, Context::createDefaultContext());
    }

    public function testPurchaseExtension(): void
    {
        $provider = $this->createMock(LicenseService::class);

        $controller = new BasketController(
            $provider
        );

        $request = new Request();
        $request->request->set('extensionId', 1);
        $request->request->set('variantId', 1);

        $response = $controller->createCart($request, Context::createDefaultContext());

        static::assertEquals(Response::HTTP_OK, $response->getStatusCode());
    }
}
