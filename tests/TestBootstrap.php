<?php declare(strict_types=1);

/*
 * (c) shopware AG <info@shopware.com>
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
use Shopware\Core\TestBootstrapper;

$bootstrapper = new TestBootstrapper();

$bootstrapper->getClassLoader()->addPsr4('SwagExtensionStore\\Tests\\', __DIR__);

$bootstrapper
    ->setPlatformEmbedded(false)
    ->addCallingPlugin()
    ->bootstrap();
