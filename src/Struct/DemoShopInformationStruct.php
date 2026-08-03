<?php

declare(strict_types=1);

namespace SwagExtensionStore\Struct;

use Shopware\Core\Framework\Log\Package;
use Shopware\Core\Framework\Struct\Struct;

/**
 * @phpstan-type DemoShopContact array{firstName: string, lastName: string}
 * @phpstan-type DemoShopInformation array{remainingDays: int, expirationDate: string, accountLink: string, contact: DemoShopContact|null}
 */
#[Package('checkout')]
class DemoShopInformationStruct extends Struct
{
    /**
     * @param DemoShopContact|null $contact
     */
    private function __construct(
        protected int $remainingDays,
        protected string $expirationDate,
        protected string $accountLink,
        protected ?array $contact,
    ) {
    }

    /**
     * @param DemoShopInformation $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            $data['remainingDays'],
            $data['expirationDate'],
            $data['accountLink'],
            $data['contact'],
        );
    }

    /**
     * @return DemoShopInformation
     */
    public function toArray(): array
    {
        return [
            'remainingDays' => $this->remainingDays,
            'expirationDate' => $this->expirationDate,
            'accountLink' => $this->accountLink,
            'contact' => $this->contact,
        ];
    }
}
