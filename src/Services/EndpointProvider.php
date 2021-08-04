<?php declare(strict_types=1);

namespace SwagExtensionStore\Services;

use OutOfBoundsException;

class EndpointProvider
{
    private array $endpoints;

    public function __construct(array $endpoints)
    {
        $this->endpoints = $endpoints;
    }

    public function get(string $endpoint)
    {
        if (isset($this->endpoints[$endpoint])) {
            return $this->endpoints[$endpoint];
        }

        throw new OutOfBoundsException(sprintf('Store endpoint "%s" not found', $endpoint));
    }
}
