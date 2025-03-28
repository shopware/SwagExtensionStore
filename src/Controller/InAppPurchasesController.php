<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\App\AppCollection;
use Shopware\Core\Framework\App\AppEntity;
use Shopware\Core\Framework\App\InAppPurchases\Gateway\InAppPurchasesGateway;
use Shopware\Core\Framework\App\InAppPurchases\Payload\InAppPurchasesPayload;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\InAppPurchase\Services\InAppPurchaseUpdater;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Exception\ExtensionStoreException;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionCollection;
use SwagExtensionStore\Struct\InAppPurchaseStruct;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * @internal
 */
#[Package('checkout')]
#[Route(defaults: ['_routeScope' => ['api']])]
class InAppPurchasesController
{
    /**
     * @param EntityRepository<AppCollection> $appRepository
     */
    public function __construct(
        private readonly InAppPurchasesService $inAppPurchasesService,
        private readonly InAppPurchaseUpdater $inAppPurchaseUpdater,
        private readonly AbstractExtensionDataProvider $extensionDataProvider,
        private readonly InAppPurchasesGateway $appPurchasesGateway,
        private readonly EntityRepository $appRepository,
    ) {
    }

    #[Route('/api/_action/in-app-purchases/{technicalName}/details', name: 'api.in-app-purchases.detail', methods: ['GET'])]
    public function getInAppPurchaseDetails(string $technicalName, Context $context): Response
    {
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('name', $technicalName));

        $extension = $this->extensionDataProvider
            ->getInstalledExtensions($context, false, $criteria)
            ->first();

        return new JsonResponse($extension);
    }

    #[Route('/api/_action/in-app-purchases/cart/new', name: 'api.in-app-purchases.cart.new', methods: ['POST'])]
    public function createCart(RequestDataBag $data, Context $context): Response
    {
        $name = $data->getString('name');
        $feature = $data->getString('feature');
        $variant = $data->getString('variant');

        $cart = $this->inAppPurchasesService->createCart($name, $feature, $variant, $context);

        return new JsonResponse($cart);
    }

    #[Route('/api/_action/in-app-purchases/cart/order', name: 'api.in-app-purchases.cart.order', methods: ['POST'])]
    public function orderCart(RequestDataBag $data, Context $context): Response
    {
        $taxRate = (float) $data->getString('taxRate');
        $positions = $data->get('positions');
        \assert($positions instanceof RequestDataBag);
        $extensionName = $data->get('name');

        $positionCollection = InAppPurchaseCartPositionCollection::fromArray($positions->all());

        $app = $this->getAppByName($extensionName, $context);
        if (!$app) {
            // if no app is found, it's a plugin, and no filtering will happen
            return $this->inAppPurchasesService->orderCart($taxRate, $positionCollection->toCart(), $context);
        }

        $payload = new InAppPurchasesPayload($positionCollection->getIdentifiers());
        $iapGatewayResponse = $this->appPurchasesGateway->process($payload, $context, $app);
        if (!$iapGatewayResponse) {
            // if $iapGatewayResponse is null, the app does not have a gateway url, and no filtering will happen
            return $this->inAppPurchasesService->orderCart($taxRate, $positionCollection->toCart(), $context);
        }

        $positionCollection = $positionCollection->filterValidInAppPurchases($positionCollection, $iapGatewayResponse->purchases);
        if ($positionCollection->count() === 0) {
            throw ExtensionStoreException::invalidInAppPurchase();
        }

        return $this->inAppPurchasesService->orderCart($taxRate, $positionCollection->toCart(), $context);
    }

    #[Route('/api/_action/in-app-purchases/{extensionName}/list', name: 'api.in-app-purchase.list', methods: ['GET'])]
    public function listPurchases(string $extensionName, Context $context): Response
    {
        $purchases = $this->inAppPurchasesService->listPurchases($extensionName, $context);

        $app = $this->getAppByName($extensionName, $context);
        if (!$app) {
            return new JsonResponse($purchases);
        }

        $payload = new InAppPurchasesPayload($purchases->getIdentifiers());
        $validCartItems = $this->appPurchasesGateway->process($payload, $context, $app);
        if (!$validCartItems) {
            return new JsonResponse($purchases);
        }

        $purchases = $purchases->filterValidInAppPurchases($purchases, $validCartItems->purchases);
        if ($purchases->count() === 0) {
            throw ExtensionStoreException::invalidInAppPurchase();
        }

        return new JsonResponse($purchases);
    }

    #[Route('/api/_action/in-app-purchases/refresh', name: 'api.in-app-purchase.refresh', methods: ['GET'])]
    public function refreshInAppPurchases(Context $context): Response
    {
        $context->scope(Context::SYSTEM_SCOPE, function (Context $context): void {
            $this->inAppPurchaseUpdater->update($context);
        });

        return new JsonResponse(status: Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/_action/in-app-purchases/{technicalName}/{inAppPurchase}', name: 'api.in-app-purchases.in-app-purchase', methods: ['GET'])]
    public function getInAppPurchase(string $technicalName, string $inAppPurchase, Context $context): Response
    {
        $inAppPurchaseCollection = $this->inAppPurchasesService->listPurchases($technicalName, $context);
        $iap = $inAppPurchaseCollection->filter(
            fn (InAppPurchaseStruct $availableInAppPurchases) => $availableInAppPurchases->getIdentifier() === $inAppPurchase
        )->first();

        return new JsonResponse($iap);
    }

    private function getAppByName(string $appName, Context $context): ?AppEntity
    {
        $criteria = new Criteria();
        $criteria->setLimit(1);
        $criteria->addFilter(new EqualsFilter('name', $appName));

        return $this->appRepository->search($criteria, $context)->getEntities()->first();
    }
}
