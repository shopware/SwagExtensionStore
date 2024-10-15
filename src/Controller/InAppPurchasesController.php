<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\App\InAppPurchases\Gateway\InAppPurchasesGateway;
use Shopware\Core\Framework\App\InAppPurchases\Payload\InAppPurchasesPayload;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\InAppPurchase\Services\InAppPurchasesSyncService;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Exception\ExtensionStoreException;
use SwagExtensionStore\Services\InAppPurchasesService;
use SwagExtensionStore\Struct\InAppPurchaseCartPositionCollection;
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
    public function __construct(
        private readonly InAppPurchasesService $inAppPurchasesService,
        private readonly InAppPurchasesSyncService $inAppPurchasesSyncService,
        private readonly AbstractExtensionDataProvider $extensionDataProvider,
        private readonly InAppPurchasesGateway $appPurchasesGateway,
    ) {}

    #[Route('/api/_action/in-app-purchases/{technicalName}/details', name: 'api.in-app-purchases.detail', methods: ['GET'])]
    public function getInAppFeature(string $technicalName, Context $context): Response
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

        $cart = $this->inAppPurchasesService->createCart($name, $feature, $context);

        return new JsonResponse($cart);
    }

    #[Route('/api/_action/in-app-purchases/cart/order', name: 'api.in-app-purchases.cart.order', methods: ['POST'])]
    public function orderCart(RequestDataBag $data, Context $context): Response
    {
        $taxRate = \floatval($data->getString('taxRate'));
        $positions = $data->get('positions');

        $positionCollection = InAppPurchaseCartPositionCollection::fromArray($positions->all());

        $validCartItems = $this->appPurchasesGateway->process(new InAppPurchasesPayload($positionCollection->getIdentifiers()));

        $filteredPositions = $positionCollection->filterValidInAppPurchases($positionCollection, $validCartItems->getPurchases());

        if ($filteredPositions->count() === 0) {
            throw ExtensionStoreException::invalidInAppPurchase();
        }

        $positions = $this->inAppPurchasesService->orderCart($taxRate, $filteredPositions->toCart(), $context);

        return new JsonResponse($positions);
    }

    #[Route('/api/_action/in-app-purchases/{extensionName}/list', name: 'api.in-app-purchase.list', methods: ['GET'])]
    public function listPurchases(string $extensionName, Context $context): Response
    {
        $purchases = $this->inAppPurchasesService->listPurchases($extensionName, $context);

        $validPurchases = $this->appPurchasesGateway->process(new InAppPurchasesPayload($purchases->getIdentifiers()));

        $filteredPurchases = $purchases->filterValidInAppPurchases($purchases, $validPurchases->getPurchases());

        return new JsonResponse($filteredPurchases);
    }

    #[Route('/api/_action/in-app-purchases/refresh', name: 'api.in-app-purchase.refresh', methods: ['GET'])]
    public function refreshInAppPurchases(Context $context): Response
    {
        $this->inAppPurchasesSyncService->disableExpiredInAppPurchases();
        $this->inAppPurchasesSyncService->updateActiveInAppPurchases($context);

        return new JsonResponse(['success' => true]);
    }
}
