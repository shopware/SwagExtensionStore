<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use SwagExtensionStore\Services\DemoShopService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * @internal
 */
#[Package('checkout')]
#[Route(defaults: ['_routeScope' => ['api'], '_acl' => ['system.extension_store']])]
class DemoShopController
{
    public function __construct(private readonly DemoShopService $demoShopService)
    {
    }

    #[Route('/api/_action/extension-store/demo-shop-information', name: 'api.extension.demo-shop-information', methods: ['GET'])]
    public function getDemoShopInformation(Context $context): JsonResponse
    {
        $demoShopInformation = $this->demoShopService->getDemoShopInformation($context);

        return new JsonResponse([
            'isDemoShop' => $demoShopInformation !== null,
            'demoShopInformation' => $demoShopInformation?->toArray(),
        ]);
    }
}
