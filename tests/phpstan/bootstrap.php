<?php declare(strict_types=1);

use Composer\Autoload\ClassLoader;
use Shopware\Core\DevOps\StaticAnalyze\StaticAnalyzeKernel;
use Shopware\Core\Framework\Adapter\Kernel\KernelFactory;
use Shopware\Core\Framework\Plugin\KernelPluginLoader\StaticKernelPluginLoader;
use SwagExtensionStore\SwagExtensionStore;
use Symfony\Component\Dotenv\Dotenv;

if (!defined('TEST_PROJECT_DIR')) {
    define('TEST_PROJECT_DIR', (static function (): string {
        if (isset($_SERVER['PROJECT_ROOT']) && is_string($_SERVER['PROJECT_ROOT']) && file_exists($_SERVER['PROJECT_ROOT'])) {
            return $_SERVER['PROJECT_ROOT'];
        }

        $dir = $rootDir = __DIR__;
        while (!file_exists($dir . '/install.lock')) {
            if ($dir === dirname($dir)) {
                return $rootDir;
            }
            $dir = dirname($dir);
        }

        return $dir;
    })());
}

$_ENV['PROJECT_ROOT'] = $_SERVER['PROJECT_ROOT'] = TEST_PROJECT_DIR;
$classLoader = require TEST_PROJECT_DIR . '/vendor/autoload.php';
assert($classLoader instanceof ClassLoader);

if (class_exists(Dotenv::class) && (file_exists(TEST_PROJECT_DIR . '/.env.local.php') || file_exists(TEST_PROJECT_DIR . '/.env') || file_exists(TEST_PROJECT_DIR . '/.env.dist'))) {
    (new Dotenv())->usePutenv()->bootEnv(TEST_PROJECT_DIR . '/.env');
}

$composer = json_decode((string) file_get_contents(__DIR__ . '/../../composer.json'), true, 512, \JSON_THROW_ON_ERROR);

$pluginLoader = new StaticKernelPluginLoader($classLoader, null, [
    [
        'name' => 'SwagExtensionStore',
        'active' => true,
        'version' => '1.0.0',
        'baseClass' => SwagExtensionStore::class,
        'managedByComposer' => 0,
        'autoload' => $composer['autoload'],
        'path' => dirname(__DIR__, 2),
    ],
]);

KernelFactory::$kernelClass = StaticAnalyzeKernel::class;

/** @var StaticAnalyzeKernel $kernel */
$kernel = KernelFactory::create('extension_store_phpstan', true, $classLoader, $pluginLoader);

$kernel->boot();

return $classLoader;
