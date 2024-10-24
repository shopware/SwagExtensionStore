<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\App\InAppPurchases\Gateway\InAppPurchasesGateway;
use Shopware\Core\Framework\App\InAppPurchases\Response\InAppPurchasesResponse;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\InAppPurchase\Services\InAppPurchasesSyncService;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use Shopware\Core\Framework\Store\Struct\ExtensionCollection;
use Shopware\Core\Framework\Store\Struct\ExtensionStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Controller\InAppPurchasesController;
use SwagExtensionStore\Exception\ExtensionStoreException;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
use SwagExtensionStore\Struct\InAppPurchaseCollection;
use Symfony\Component\HttpFoundation\Response;

class InAppPurchasesControllerTest extends TestCase
{
    public function testGetInAppFeature(): void
    {
        $extension = new ExtensionStruct();
        $extension->setName('testExtension');
        $service = $this->createMock(InAppPurchasesService::class);
        $dataProvider = $this->createMock(AbstractExtensionDataProvider::class);
        $dataProvider->expects(static::once())
            ->method('getInstalledExtensions')
            ->willReturn(new ExtensionCollection([$extension]));

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $dataProvider, $this->createMock(InAppPurchasesGateway::class));

        $content = $this->validateResponse(
            $controller->getInAppFeature('testExtension', Context::createDefaultContext()),
        );

        static::assertSame('testExtension', $content['name']);
    }

    public function testCreateCart(): void
    {
        $cartStruct = $this->getInAppPurchaseCartStruct();
        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::once())
            ->method('createCart')
            ->willReturn($cartStruct);

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $this->createMock(AbstractExtensionDataProvider::class), $this->createMock(InAppPurchasesGateway::class));

        $requestDataBag = new RequestDataBag([
            'name' => 'testExtension',
            'feature' => 'testFeature',
        ]);

        $content = $this->validateResponse(
            $controller->createCart($requestDataBag, Context::createDefaultContext()),
        );

        static::assertSame(50, $content['netPrice']);
        static::assertSame(59.5, $content['grossPrice']);
        static::assertSame(9.5, $content['taxValue']);
        static::assertSame(19, $content['taxRate']);
        static::assertSame('testFeature', $content['positions'][0]['feature']['identifier']);
        static::assertSame('Test Feature', $content['positions'][0]['feature']['name']);
        static::assertSame('random-type', $content['positions'][0]['priceModel']['type']);
        static::assertSame(59.5, $content['positions'][0]['priceModel']['price']);
    }

    public function testOrderCartWithValidItem(): void
    {
        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::once())
            ->method('orderCart')
            ->willReturn($this->getInAppPurchaseCartStruct());

        $response = new InAppPurchasesResponse();
        $response->setPurchases(['some-app-and-feature-name']);

        $gateway = $this->createMock(InAppPurchasesGateway::class);
        $gateway->expects(static::once())
            ->method('process')
            ->willReturn($response);

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $this->createMock(AbstractExtensionDataProvider::class), $gateway);

        $requestDataBag = new RequestDataBag([
            'taxRate' => '19.0',
            'positions' => [[
                'inAppFeatureIdentifier' => 'some-app-and-feature-name',
                'netPrice' => 50.0,
                'grossPrice' => 59.5,
                'taxRate' => 19.0,
                'taxValue' => 9.5,
            ]],
        ]);

        $content = $this->validateResponse(
            $controller->orderCart($requestDataBag, Context::createDefaultContext()),
        );

        static::assertSame(50, $content['netPrice']);
        static::assertSame(59.5, $content['grossPrice']);
        static::assertSame(9.5, $content['taxValue']);
        static::assertSame(19, $content['taxRate']);
        static::assertSame('testFeature', $content['positions'][0]['feature']['identifier']);
        static::assertSame('Test Feature', $content['positions'][0]['feature']['name']);
        static::assertSame('random-type', $content['positions'][0]['priceModel']['type']);
        static::assertSame(59.5, $content['positions'][0]['priceModel']['price']);
    }

    public function testOrderCartWithInvalidItem(): void
    {
        static::expectException(ExtensionStoreException::class);
        static::expectExceptionMessage('The in-app purchase could not be completed. Please contact the extension provider.');

        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::never())
            ->method('orderCart');

        $response = new InAppPurchasesResponse();

        $gateway = $this->createMock(InAppPurchasesGateway::class);
        $gateway->expects(static::once())
            ->method('process')
            ->willReturn($response);

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $this->createMock(AbstractExtensionDataProvider::class), $gateway);

        $requestDataBag = new RequestDataBag([
            'taxRate' => '19.0',
            'positions' => [[
                'inAppFeatureIdentifier' => 'some-app-and-feature-name',
                'netPrice' => 50.0,
                'grossPrice' => 59.5,
                'taxRate' => 19.0,
                'taxValue' => 9.5,
            ]],
        ]);

        $controller->orderCart($requestDataBag, Context::createDefaultContext());
    }

    public function testListPurchasesWithValidItems(): void
    {
        $context = Context::createDefaultContext();
        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::once())
            ->method('listPurchases')
            ->with('TestApp', $context)
            ->willReturn($this->getInAppPurchaseCollection());

        $response = new InAppPurchasesResponse();
        $response->setPurchases(['testFeature2', 'testFeature', 'testFeature3']);

        $gateway = $this->createMock(InAppPurchasesGateway::class);
        $gateway->expects(static::once())
            ->method('process')
            ->willReturn($response);

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $this->createMock(AbstractExtensionDataProvider::class), $gateway);
        $content = $this->validateResponse(
            $controller->listPurchases('TestApp', $context),
        );

        static::assertCount(3, $content);
    }

    public function testListPurchasesWithInvalidItems(): void
    {
        $context = Context::createDefaultContext();
        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::once())
            ->method('listPurchases')
            ->with('TestApp', $context)
            ->willReturn($this->getInAppPurchaseCollection());

        $response = new InAppPurchasesResponse();
        $response->setPurchases(['testFeature2', 'testFeature']);

        $gateway = $this->createMock(InAppPurchasesGateway::class);
        $gateway->expects(static::once())
            ->method('process')
            ->willReturn($response);

        $controller = new InAppPurchasesController($service, $this->createMock(InAppPurchasesSyncService::class), $this->createMock(AbstractExtensionDataProvider::class), $gateway);
        $content = $this->validateResponse(
            $controller->listPurchases('TestApp', $context),
        );

        static::assertCount(2, $content);
    }

    public function testRefreshInAppPurchases(): void
    {
        $context = Context::createDefaultContext();

        $inAppPurchaseSyncService = $this->createMock(InAppPurchasesSyncService::class);
        $inAppPurchaseSyncService->expects(static::once())
            ->method('updateActiveInAppPurchases')
            ->with($context);
        $inAppPurchaseSyncService->expects(static::once())
            ->method('disableExpiredInAppPurchases');

        $controller = new InAppPurchasesController($this->createMock(InAppPurchasesService::class), $inAppPurchaseSyncService, $this->createMock(AbstractExtensionDataProvider::class), $this->createMock(InAppPurchasesGateway::class));

        $content = $this->validateResponse($controller->refreshInAppPurchases($context));

        static::assertSame(['success' => true], $content);
    }

    private function getInAppPurchaseCartStruct(): InAppPurchaseCartStruct
    {
        $cartStruct = InAppPurchaseCartStruct::fromArray($this->getInAppPurchaseCartStructArray());

        return $cartStruct;
    }

    /**
     * @return array<mixed> $response
     */
    private function validateResponse(Response $response): array
    {
        static::assertSame(Response::HTTP_OK, $response->getStatusCode());
        $content = $response->getContent();
        static::assertNotFalse($content);
        $response = json_decode($content, true, 512, \JSON_THROW_ON_ERROR);
        static::assertIsArray($response);

        return $response;
    }

    private function getInAppPurchaseCollection(bool $valid = true): InAppPurchaseCollection
    {
        return InAppPurchaseCollection::fromArray(array_filter([
            [
                'identifier' => 'testFeature',
                'name' => 'Test Feature',
                'description' => null,
                'priceModel' => [
                    'type' => 'random-type',
                    'price' => 59.5,
                    'duration' => 'yearly',
                    'oneTimeOnly' => false,
                ],
            ],
            $valid ? [
                'identifier' => 'testFeature2',
                'name' => 'Test Feature 2',
                'description' => null,
                'priceModel' => [
                    'type' => 'monthly-type',
                    'price' => 1.5,
                    'duration' => 'monthly',
                    'oneTimeOnly' => false,
                ],
            ] : null,
            [
                'identifier' => 'testFeature3',
                'name' => 'Test Feature 3',
                'description' => null,
                'priceModel' => [
                    'type' => 'monthly-type',
                    'price' => 1.5,
                    'duration' => 'monthly',
                    'oneTimeOnly' => false,
                ],
            ],
        ]));
    }

    /**
     * @return array{positions: array<array{inAppFeatureIdentifier: string, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}>, bookingShop: array{}|array{id: int, domain: string}, licenseShop: array{}|array{id: int, domain: string}, netPrice: float, grossPrice: float, taxRate: float, taxValue: float}
     */
    public function getInAppPurchaseCartStructArray(): array
    {
        return [
            'netPrice' => 50.0,
            'grossPrice' => 59.5,
            'taxRate' => 19.0,
            'taxValue' => 9.5,
            'positions' => [
                [
                    'inAppFeatureIdentifier' => 'some-app-and-feature-name',
                    'priceModel' => [
                        'type' => 'random-type',
                        'price' => 59.5,
                        'duration' => null,
                        'oneTimeOnly' => false,
                    ],
                    'feature' => [
                        'name' => 'Test Feature',
                        'identifier' => 'testFeature',
                        'description' => null,
                        'priceModels' => [
                            'type' => 'random-type',
                            'price' => 59.5,
                            'duration' => null,
                            'oneTimeOnly' => false,
                        ],
                    ],
                    'netPrice' => 50.0,
                    'grossPrice' => 59.5,
                    'taxRate' => 19.0,
                    'taxValue' => 9.5,
                ],
            ],
            'bookingShop' => [],
            'licenseShop' => [],
        ];
    }
}
