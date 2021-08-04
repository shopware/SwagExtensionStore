<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Authentication;

use Shopware\Core\Framework\Api\Context\AdminApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Exception\EntityNotFoundException;
use Shopware\Core\Framework\Uuid\Uuid;
use PHPUnit\Framework\TestCase;
use SwagExtensionStore\Authentication\LocaleProviderPolyfill;
use SwagExtensionStore\Tests\PolyfillTestBehaviour;

class LocaleProviderPolyfillTest extends TestCase
{
    use PolyfillTestBehaviour;

    private EntityRepositoryInterface $userRepository;
    private LocaleProviderPolyfill $localeProvider;

    public function setUp(): void
    {
        $this->localeProvider = $this->getContainer()->get(LocaleProviderPolyfill::class);
    }

    public function testGetLocaleFromContextReturnsLocaleFromUser(): void
    {
        $userId = Uuid::randomHex();
        $userLocale = 'abc-de';

        $this->getUserRepository()->create([[
            'id' => $userId,
            'username' => 'testUser',
            'firstName' => 'first',
            'lastName' => 'last',
            'email' => 'first@last.de',
            'password' => 'shopware',
            'locale' => [
                'code' => $userLocale,
                'name' => 'testLocale',
                'territory' => 'somewhere',
            ],
        ]], Context::createDefaultContext());

        $context = Context::createDefaultContext(new AdminApiSource($userId));

        $locale = $this->localeProvider->getLocaleFromContext($context);

        static::assertEquals($userLocale, $locale);
    }

    public function testGetLocaleFromContextThrowsExceptionIfUserNotFound(): void
    {
        $context = Context::createDefaultContext(new AdminApiSource(Uuid::randomHex()));

        static::expectException(EntityNotFoundException::class);

        $this->localeProvider->getLocaleFromContext($context);
    }

    public function testGetLocaleFromContextReturnsEnglishForSystemContext(): void
    {
        $locale = $this->localeProvider->getLocaleFromContext(Context::createDefaultContext());

        static::assertEquals('en-GB', $locale);
    }

    public function testGetLocaleFromContextReturnsEnglishForIntegrations(): void
    {
        $locale = $this->localeProvider->getLocaleFromContext(
            Context::createDefaultContext(new AdminApiSource(null, Uuid::randomHex()))
        );

        static::assertEquals('en-GB', $locale);
    }
}
