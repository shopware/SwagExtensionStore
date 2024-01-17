<?php

declare(strict_types=1);

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Exception\InvalidExtensionCartException;
use SwagExtensionStore\Services\LicenseService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @internal
 */
#[Route(defaults: ['_routeScope' => ['api'], '_acl' => ['system.plugin_maintain']])]
#[Package('services-settings')]
class LicenseController
{
    private LicenseService $licenseService;

    public function __construct(LicenseService $licenseService)
    {
        $this->licenseService = $licenseService;
    }

    #[Route('/api/_action/extension-store/cart/new', name: 'api.extension.create_new_cart', methods: ['POST'])]
    public function createCart(Request $request, Context $context): JsonResponse
    {
        $extensionId = $request->request->get('extensionId');
        $variantId = $request->request->get('variantId');

        if (!is_numeric($extensionId)) {
            throw new InvalidExtensionIdException();
        }

        if (!is_numeric($variantId)) {
            throw new InvalidVariantIdException();
        }

        $cart = $this->licenseService->createCart((int) $extensionId, (int) $variantId, $context);

        return new JsonResponse($cart);
    }

    #[Route('/api/_action/extension-store/cart/order', name: 'api.extension.order', methods: ['POST'])]
    public function orderCart(RequestDataBag $bag, Context $context): Response
    {
        try {
            $cart = CartStruct::fromArray($bag->all());
        } catch (\TypeError $e) {
            throw new InvalidExtensionCartException();
        }

        $this->licenseService->orderCart($cart, $context);

        return new Response('', Response::HTTP_NO_CONTENT);
    }

    #[Route('/api/_action/extension-store/cart/payment-means', name: 'api.extension.payment-means', methods: ['GET'])]
    public function availablePaymentMeans(Context $context): Response
    {
        return new JsonResponse($this->licenseService->availablePaymentMeans($context));
    }
}
