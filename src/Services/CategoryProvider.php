<?php

namespace SwagExtensionStore\Services;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Store\Struct\StoreCategoryCollection;

class CategoryProvider
{
    private StoreClient $client;

    public function __construct(StoreClient $client)
    {
        $this->client = $client;
    }

    public function getCategories(Context $context): StoreCategoryCollection
    {
        return new StoreCategoryCollection($this->client->getCategories($context));
    }
}
