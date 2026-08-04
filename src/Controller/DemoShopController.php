<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

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

    #[Route('/api/_action/extension-store/demo-shop-status', name: 'api.extension.demo-shop-status', methods: ['GET'])]
    public function getDemoShopStatus(): JsonResponse
    {
        return new JsonResponse([
            'isDemoShop' => $this->demoShopService->isDemoShop(),
        ]);
    }
}
