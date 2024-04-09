<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Search\ExtensionCriteria;
use SwagExtensionStore\Services\StoreClient;
use SwagExtensionStore\Services\StoreDataProvider;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * @internal
 *
 * @phpstan-import-type RequestQueryParameters from StoreClient
 */
#[Package('checkout')]
#[Route(defaults: ['_routeScope' => ['api'], '_acl' => ['system.plugin_maintain']])]
class DataController
{
    private StoreDataProvider $dataProvider;

    public function __construct(StoreDataProvider $dataProvider)
    {
        $this->dataProvider = $dataProvider;
    }

    #[Route('/api/_action/extension-store/list', name: 'api.extension.list', methods: ['POST', 'GET'])]
    public function getExtensionList(Request $request, Context $context): Response
    {
        if ($request->getMethod() === Request::METHOD_POST) {
            $criteria = ExtensionCriteria::fromArray($request->request->all());
        } else {
            $criteria = ExtensionCriteria::fromArray($request->query->all());
        }

        $listing = $this->dataProvider->getListing($criteria, $context);

        return new JsonResponse([
            'data' => $listing,
            'meta' => [
                'total' => $listing->getTotal(),
            ],
        ]);
    }

    #[Route('/api/_action/extension-store/detail/{id}', name: 'api.extension.detail', methods: ['GET'])]
    public function detail(int $id, Context $context): Response
    {
        return new JsonResponse($this->dataProvider->getExtensionDetails($id, $context));
    }

    #[Route('/api/_action/extension-store/{id}/reviews', name: 'api.extension.reviews', methods: ['GET'])]
    public function reviews(int $id, Request $request, Context $context): Response
    {
        $criteria = ExtensionCriteria::fromArray($request->query->all());

        return new JsonResponse($this->dataProvider->getReviews($id, $criteria, $context));
    }

    #[Route('/api/_action/extension-store/store-filters', name: 'api.extension.store_filters', methods: ['GET'])]
    public function listingFilters(Request $request, Context $context): JsonResponse
    {
        /** @var RequestQueryParameters $params */
        $params = $request->query->all();

        return new JsonResponse($this->dataProvider->getListingFilters($params, $context));
    }
}
