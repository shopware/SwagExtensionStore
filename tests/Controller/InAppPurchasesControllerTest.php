<?php

declare(strict_types=1);

namespace SwagExtensionStore\Tests\Controller;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use Shopware\Core\Framework\Store\Struct\ExtensionCollection;
use Shopware\Core\Framework\Store\Struct\ExtensionStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Controller\InAppPurchasesController;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Struct\InAppPurchaseCartStruct;
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

        $controller = new InAppPurchasesController($service, $dataProvider);

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

        $controller = new InAppPurchasesController($service, $this->createMock(AbstractExtensionDataProvider::class));

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
        static::assertSame('testFeature', $content['positions'][0]['feature']['name']);
        static::assertSame('random-type', $content['positions'][0]['priceModel']['type']);
        static::assertSame(59.5, $content['positions'][0]['priceModel']['price']);
    }

    public function testOrderCart(): void
    {
        $service = $this->createMock(InAppPurchasesService::class);
        $service->expects(static::once())
            ->method('orderCart')
            ->willReturn($this->getInAppPurchaseCartStruct());

        $controller = new InAppPurchasesController($service, $this->createMock(AbstractExtensionDataProvider::class));

        $requestDataBag = new RequestDataBag([
            'name' => 'testExtension',
            'feature' => 'testFeature',
        ]);

        $content = $this->validateResponse(
            $controller->orderCart($requestDataBag, Context::createDefaultContext()),
        );

        static::assertSame(50, $content['netPrice']);
        static::assertSame(59.5, $content['grossPrice']);
        static::assertSame(9.5, $content['taxValue']);
        static::assertSame(19, $content['taxRate']);
        static::assertSame('testFeature', $content['positions'][0]['feature']['identifier']);
        static::assertSame('testFeature', $content['positions'][0]['feature']['name']);
        static::assertSame('random-type', $content['positions'][0]['priceModel']['type']);
        static::assertSame(59.5, $content['positions'][0]['priceModel']['price']);
    }

    /**
     * @return InAppPurchaseCartStruct
     */
    public function getInAppPurchaseCartStruct(): InAppPurchaseCartStruct
    {
        $cartStruct = InAppPurchaseCartStruct::fromArray([
            'netPrice' => 50.0,
            'grossPrice' => 59.5,
            'taxRate' => 19.0,
            'taxValue' => 9.5,
            'positions' => [
                [
                    'priceModel' => [
                        'type' => 'random-type',
                        'price' => 59.5,
                        'duration' => null,
                        'oneTimeOnly' => false,
                    ],
                    'feature' => [
                        'name' => 'testFeature',
                        'identifier' => 'testFeature',
                        'description' => null,
                        'priceModels' => [
                            [
                                'type' => 'random-type',
                                'price' => 59.5,
                                'duration' => null,
                                'oneTimeOnly' => false,
                            ],
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
        ]);
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
}
