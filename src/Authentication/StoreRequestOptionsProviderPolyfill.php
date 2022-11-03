<?php declare(strict_types=1);

namespace SwagExtensionStore\Authentication;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Api\Context\Exception\InvalidContextSourceException;
use Shopware\Core\Framework\Api\Context\Exception\InvalidContextSourceUserException;
use Shopware\Core\Framework\Api\Context\SystemSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\NotFilter;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\System\User\UserEntity;

/**
 * @deprecated tag:v2.0.0 - Will be removed and its usages replaced by Shopware\Core\Framework\Store\Authentication\StoreRequestOptionsProvider
 */
class StoreRequestOptionsProviderPolyfill
{
    public const CONFIG_KEY_STORE_LICENSE_DOMAIN = 'core.store.licenseHost';
    public const CONFIG_KEY_STORE_SHOP_SECRET = 'core.store.shopSecret';

    private const SHOPWARE_PLATFORM_TOKEN_HEADER = 'X-Shopware-Platform-Token';
    private const SHOPWARE_SHOP_SECRET_HEADER = 'X-Shopware-Shop-Secret';

    private EntityRepositoryInterface $userRepository;
    private SystemConfigService $systemConfigService;
    private InstanceServicePolyfill $instanceService;
    private LocaleProviderPolyfill $localeProvider;

    public function __construct(
        EntityRepositoryInterface $userRepository,
        SystemConfigService $systemConfigService,
        InstanceServicePolyfill $instanceService,
        LocaleProviderPolyfill $localeProvider
    ) {
        $this->userRepository = $userRepository;
        $this->systemConfigService = $systemConfigService;
        $this->instanceService = $instanceService;
        $this->localeProvider = $localeProvider;
    }

    public function getAuthenticationHeader(Context $context): array
    {
        return array_filter([
            self::SHOPWARE_PLATFORM_TOKEN_HEADER => $this->getUserStoreToken($context),
            self::SHOPWARE_SHOP_SECRET_HEADER => $this->systemConfigService->get(self::CONFIG_KEY_STORE_SHOP_SECRET),
        ]);
    }

    public function getDefaultQueryParameters(?Context $context): array
    {
        return [
            'shopwareVersion' => $this->instanceService->getShopwareVersion(),
            'language' => $this->getLanguage($context),
            'domain' => $this->getLicenseDomain(),
        ];
    }

    private function getUserStoreToken(Context $context): ?string
    {
        try {
            return $this->getTokenFromAdmin($context);
        } catch (InvalidContextSourceException $e) {
            return $this->getTokenFromSystem($context);
        }
    }

    private function getTokenFromAdmin(Context $context): ?string
    {
        $contextSource = $this->ensureAdminApiSource($context);
        $userId = $contextSource->getUserId();
        if ($userId === null) {
            throw new InvalidContextSourceUserException(\get_class($contextSource));
        }

        return $this->fetchUserStoreToken(new Criteria([$userId]), $context);
    }

    private function getTokenFromSystem(Context $context): ?string
    {
        $contextSource = $context->getSource();
        if (!($contextSource instanceof SystemSource)) {
            throw new InvalidContextSourceException(SystemSource::class, \get_class($contextSource));
        }

        $criteria = new Criteria();
        $criteria->addFilter(
            new NotFilter(NotFilter::CONNECTION_OR, [new EqualsFilter('storeToken', null)])
        );

        return $this->fetchUserStoreToken($criteria, $context);
    }

    private function fetchUserStoreToken(Criteria $criteria, Context $context): ?string
    {
        /** @var UserEntity|null $user */
        $user = $this->userRepository->search($criteria, $context)->first();

        if ($user === null) {
            return null;
        }

        return $user->getStoreToken();
    }

    private function getLanguage(?Context $context): string
    {
        if ($context === null) {
            return LocaleProviderPolyfill::LANGUAGE_FALLBACK;
        }

        return $this->localeProvider->getLocaleFromContext($context);
    }

    private function getLicenseDomain(): string
    {
        return $this->systemConfigService->get(self::CONFIG_KEY_STORE_LICENSE_DOMAIN) ?? '';
    }

    private function ensureAdminApiSource(Context $context): AdminApiSource
    {
        $contextSource = $context->getSource();
        if (!($contextSource instanceof AdminApiSource)) {
            throw new InvalidContextSourceException(AdminApiSource::class, \get_class($contextSource));
        }

        return $contextSource;
    }
}
