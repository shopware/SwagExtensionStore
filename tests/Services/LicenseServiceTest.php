<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Services\AbstractExtensionStoreLicensesService;
use Shopware\Core\Framework\Store\Services\StoreService;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use SwagExtensionStore\Services\LicenseService;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Services\StoreDataProvider;

class LicenseServiceTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    private LicenseService $licenseService;

    private AbstractExtensionStoreLicensesService $coreLicenseService;

    public function setUp(): void
    {
        $this->licenseService = $this->getContainer()->get(LicenseService::class);
        $this->coreLicenseService = $this->getContainer()->get(AbstractExtensionStoreLicensesService::class);
    }

    public function testCreateCart(): void
    {
        $this->getContainer()
            ->get(SystemConfigService::class)
            ->set(StoreService::CONFIG_KEY_STORE_LICENSE_DOMAIN, 'localhost');
        $this->setResponsesToPurchaseExtension();

        $cart = $this->licenseService->createCart(5, 5, $this->getContextWithStoreToken());
        static::assertInstanceOf(CartStruct::class, $cart);
    }

    public function testAvailablePaymentMeans(): void
    {
        $storeClientMock = $this->createMock(StoreClient::class);
        $storeClientMock->method('availablePaymentMeans')
            ->willReturn(['test' => 'success']);

        $response = (new LicenseService(
            $storeClientMock,
        ))->availablePaymentMeans(Context::createDefaultContext());

        static::assertSame([
            'test' => 'success',
        ], $response);
    }

    public function testCancelSubscriptionRemovesLicense(): void
    {
        $context = $this->getContextWithStoreToken();
        $this->getContainer()
            ->get(SystemConfigService::class)
            ->set(StoreService::CONFIG_KEY_STORE_LICENSE_DOMAIN, 'localhost');
        $this->setResponsesToPurchaseExtension();

        $cart = $this->licenseService->createCart(5, 5, $context);
        $this->licenseService->orderCart($cart, $context);

        $this->setCancellationResponses();

        $this->coreLicenseService->cancelSubscription(1, $context);

        static::assertEquals(
            '/swplatform/pluginlicenses/1/cancel?shopwareVersion=___VERSION___&language=en-GB&domain=localhost',
            $this->getRequestHandler()->getLastRequest()?->getRequestTarget()
        );
    }

    private function getContextWithStoreToken(): Context
    {
        $userId = Uuid::randomHex();

        $data = [[
            'id' => $userId,
            'localeId' => $this->getLocaleIdOfSystemLanguage(),
            'username' => 'foobar',
            'password' => 'asdasdasdasd',
            'firstName' => 'Foo',
            'lastName' => 'Bar',
            'email' => 'foo@bar.com',
            'storeToken' => Uuid::randomHex(),
            'admin' => true,
            'aclRoles' => [],
        ]];

        $this->getContainer()
            ->get('user.repository')
            ->create($data, Context::createDefaultContext());
        $source = new AdminApiSource($userId);
        $source->setIsAdmin(true);

        return Context::createDefaultContext($source);
    }

    private function setResponsesToPurchaseExtension(): void
    {
        $this->getRequestHandler()->reset();
        $exampleCart = file_get_contents(__DIR__ . '/../_fixtures/responses/example-cart.json');
        static::assertIsString($exampleCart);

        // createCart will respond with a cart
        $this->getRequestHandler()->append(new Response(200, [], $exampleCart));

        // processCart will return a Created Response without body
        $this->getRequestHandler()->append(new Response(201, [], null));

        // return path to app files from install extension
        $this->getRequestHandler()->append(new Response(200, [], '{"location": "http://localhost/my.zip", "type": "app"}'));

        $testAppZip = file_get_contents(__DIR__ . '/../_fixtures/TestApp.zip');
        static::assertIsString($testAppZip);
        $this->getRequestHandler()->append(new Response(200, [], $testAppZip));
    }

    private function setLicensesRequest(string $licenseBody): void
    {
        $this->getRequestHandler()->reset();
        $this->getRequestHandler()->append(new Response(200, [], $licenseBody));
    }

    private function setCancellationResponses(): void
    {
        $licensesJson = \file_get_contents(__DIR__ . '/../_fixtures/responses/licenses.json');
        static::assertIsString($licensesJson);
        $licenses = \json_decode($licensesJson, true);
        $licenses[0]['extension']['name'] = 'TestApp';
        $licensesJson = \json_encode($licenses);
        static::assertIsString($licensesJson);

        $this->setLicensesRequest($licensesJson);
        $this->getRequestHandler()->append(new Response(204));

        unset($licenses[0]);
        $licensesJson = \json_encode($licenses);
        static::assertIsString($licensesJson);
        $this->getRequestHandler()->append(
            new Response(
                200,
                [StoreDataProvider::HEADER_NAME_TOTAL_COUNT => '0'],
                $licensesJson
            )
        );
    }
}
