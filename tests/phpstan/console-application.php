<?php declare(strict_types=1);

namespace Shopware\Core\DevOps\StaticAnalyze\PHPStan;

use Shopware\Core\DevOps\StaticAnalyze\StaticAnalyzeKernel;
use Shopware\Core\Framework\Plugin\KernelPluginLoader\StaticKernelPluginLoader;
use Symfony\Bundle\FrameworkBundle\Console\Application;

$classLoader = require __DIR__ . '/bootstrap.php';

$pluginLoader = new StaticKernelPluginLoader($classLoader);

$kernel = new StaticAnalyzeKernel('extension_store_phpstan_console', true, $pluginLoader, 'phpstan-test-cache-id');
$kernel->boot();

return new Application($kernel);
