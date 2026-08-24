<?php declare(strict_types=1);

namespace SwagExtensionStore\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;

/**
 * @internal
 */
#[Package('checkout')]
class Migration1779864357StoreIFrameUrlConfig extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1779864357;
    }

    public function update(Connection $connection): void
    {
        $configurationKey = 'SwagExtensionStore.config.iframeUrl';
        $configurationExists = $connection->fetchOne(
            'SELECT 1 FROM system_config WHERE configuration_key = :configurationKey',
            ['configurationKey' => $configurationKey],
        );

        if ($configurationExists !== false) {
            return;
        }

        $connection->insert('system_config', [
            'id' => Uuid::randomBytes(),
            'configuration_key' => $configurationKey,
            'configuration_value' => '{"_value": "https://sky-bridge-store.production.shopware.in"}',
            'created_at' => (new \DateTimeImmutable())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);
    }
}
