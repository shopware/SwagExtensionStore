<?php

namespace SwagExtensionStore\Controller;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Routing\Annotation\Acl;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Shopware\Core\Framework\Routing\Annotation\Since;
use Shopware\Core\Framework\Store\Exception\InvalidExtensionIdException;
use Shopware\Core\Framework\Store\Exception\InvalidVariantIdException;
use Shopware\Core\Framework\Store\Struct\CartStruct;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use SwagExtensionStore\Services\LicenseService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @internal
 * @RouteScope(scopes={"api"})
 * @Acl({"system.plugin_maintain"})
 */
class BasketController
{
    private LicenseService $licenseService;

    public function __construct(LicenseService $licenseService)
    {
        $this->licenseService = $licenseService;
    }

    /**
     * @Since("6.4.0.0")
     * @Route("/api/_action/extension-store/cart/new", name="api.extension.create_new_cart", methods={"POST"})
     */
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

    /**
     * @Since("6.4.0.0")
     * @Route("/api/_action/extension-store/cart/order", name="api.extension.order", methods={"POST"})
     */
    public function orderCart(RequestDataBag $bag, Context $context): Response
    {
        $cart = CartStruct::fromArray($bag->all());

        $this->licenseService->orderCart($cart, $context);

        return new Response('', Response::HTTP_NO_CONTENT);
    }
}
