<?php declare(strict_types=1);

/*
 * (c) shopware AG <info@shopware.com>
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use Shopware\Core\Framework\Test\TestCaseBase\KernelLifecycleManager;
use Symfony\Component\Dotenv\Dotenv;

function getProjectDir(): string
{
    if (isset($_SERVER['PROJECT_ROOT']) && \file_exists($_SERVER['PROJECT_ROOT'])) {
        return $_SERVER['PROJECT_ROOT'];
    }
    if (isset($_ENV['PROJECT_ROOT']) && \file_exists($_ENV['PROJECT_ROOT'])) {
        return $_ENV['PROJECT_ROOT'];
    }

    $rootDir = __DIR__;
    $dir = $rootDir;
    while (!\file_exists($dir . '/.env')) {
        if ($dir === \dirname($dir)) {
            return $rootDir;
        }
        $dir = \dirname($dir);
    }

    return $dir;
}

require __DIR__ . '/KernelLifecycleManager.php';

$testProjectDir = getProjectDir();

/** @var \Composer\Autoload\ClassLoader $loader */
$loader = require $testProjectDir . '/vendor/autoload.php';
KernelLifecycleManager::prepare($loader);
$loader->addPsr4('SwagExtensionStore\\Tests\\', __DIR__);
$loader->addPsr4('SwagExtensionStore\\', dirname(__DIR__) . '/src');

if (!\class_exists(Dotenv::class)) {
    throw new RuntimeException('APP_ENV environment variable is not defined. You need to define environment variables for configuration or add "symfony/dotenv" as a Composer dependency to load variables from a .env file.');
}
(new Dotenv(true))->load($testProjectDir . '/.env');

$dbUrl = \getenv('DATABASE_URL');
if ($dbUrl !== false) {
    \putenv('DATABASE_URL=' . $dbUrl . '_test');
}
