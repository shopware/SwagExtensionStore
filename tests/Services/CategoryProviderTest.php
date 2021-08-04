<?php declare(strict_types=1);

namespace SwagExtensionStore\Tests\Services;

use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Test\Store\StoreClientBehaviour;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use SwagExtensionStore\Services\CategoryProvider;

class CategoryProviderTest extends TestCase
{
    use IntegrationTestBehaviour;
    use StoreClientBehaviour;

    public function testGetCategories(): void
    {
        $categoryProvider = $this->getContainer()->get(CategoryProvider::class);

        $categoryResponse = \file_get_contents(__DIR__ . '/../_fixtures/categories-listing.json');

        // add extensions to compare structs later
        $categoryAsArray = array_map(function ($category) {
            $category['extensions'] = [];

            return $category;
        }, \json_decode($categoryResponse, true));

        $this->getRequestHandler()->reset();
        $this->getRequestHandler()->append(new Response(200, [], $categoryResponse));

        $categories = $categoryProvider->getCategories(Context::createDefaultContext());

        static::assertEquals(\count($categoryAsArray), $categories->count());
        static::assertEquals($categoryAsArray, \json_decode(\json_encode($categories), true));
    }
}
