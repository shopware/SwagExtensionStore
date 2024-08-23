<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Services\AbstractExtensionDataProvider;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
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
        private readonly AbstractExtensionDataProvider $extensionDataProvider,
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
        $positions = \json_decode($data->getString('positions'), true, 512, \JSON_THROW_ON_ERROR);

        $positionCollection = InAppPurchaseCartPositionCollection::fromArray($positions);

        $positions = $this->inAppPurchasesService->orderCart($taxRate, $positionCollection, $context);

        return new JsonResponse($positions);
    }

    #[Route('/api/_action/in-app-purchase/{name}/list', name: 'api.in-app-purchase.list', methods: ['GET'])]
    public function listPurchases(string $extensionName, Context $context): Response
    {
        $purchases = $this->inAppPurchasesService->listPurchases($extensionName, $context);

        return new JsonResponse($purchases);
    }
}
