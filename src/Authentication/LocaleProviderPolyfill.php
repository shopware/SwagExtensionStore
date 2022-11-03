<?php declare(strict_types=1);

namespace SwagExtensionStore\Authentication;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Exception\EntityNotFoundException;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\Locale\LocaleEntity;
use Shopware\Core\System\User\UserDefinition;
use Shopware\Core\System\User\UserEntity;

/**
 * @deprecated tag:v2.0.0 - Will be removed and its usages replaced by Shopware\Core\Framework\Store\Authentication\LocaleProvider
 */
class LocaleProviderPolyfill
{
    public const LANGUAGE_FALLBACK = 'en-GB';

    private EntityRepositoryInterface $userRepository;

    public function __construct(EntityRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getLocaleFromContext(Context $context): string
    {
        if (!$context->getSource() instanceof AdminApiSource) {
            return self::LANGUAGE_FALLBACK;
        }

        /** @var AdminApiSource $source */
        $source = $context->getSource();

        if ($source->getUserId() === null) {
            return self::LANGUAGE_FALLBACK;
        }

        $criteria = new Criteria([$source->getUserId()]);
        $criteria->addAssociation('locale');

        /** @var UserEntity $user */
        $user = $this->userRepository->search($criteria, $context)->first();

        if ($user === null) {
            throw new EntityNotFoundException(UserDefinition::ENTITY_NAME, $source->getUserId());
        }

        /** @var LocaleEntity $locale */
        $locale = $user->getLocale();

        return $locale->getCode();
    }
}
