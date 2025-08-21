import type { ShopwareDiscountCampaignService } from 'src/app/service/discount-campaign.service';
import type { ExtensionVariant } from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';

export default class ExtensionStoreService {
    constructor(
        private readonly discountCampaignService: ShopwareDiscountCampaignService,
        private readonly extensionService: ShopwareExtensionService,
    ) {
    }

    public orderVariantsByPricePerMonth(variants: ExtensionVariant[]): ExtensionVariant[] {
        return variants.sort((first, second) => {
            const firstPrice = this.getPriceFromVariant(first, true);
            const secondPrice = this.getPriceFromVariant(second, true);

            return firstPrice - secondPrice;
        });
    }

    public getPriceFromVariant(variant: ExtensionVariant, perMonth = false): number {
        if (this.isVariantDiscounted(variant)) {
            return perMonth ? variant?.discountCampaign.discountedPricePerMonth : variant?.discountCampaign.discountedPrice;
        }

        return perMonth ? (variant as ExtensionVariant & { netPricePerMonth: number })?.netPricePerMonth : variant?.netPrice;
    }

    public isExtensionDiscounted(variants: ExtensionVariant[]): boolean {
        return variants.some((variant) => this.isVariantDiscounted(variant));
    }

    public isVariantDiscounted(variant: ExtensionVariant): variant is ExtensionVariant & {
        discountCampaign: {
            discountedPrice: number;
            discountedPricePerMonth: number;
        };
    } {
        if (
            !variant.discountCampaign ||
            typeof variant.discountCampaign.discountedPrice !== 'number' ||
            variant.discountCampaign.discountedPrice === variant.netPrice
        ) {
            return false;
        }

        return this.discountCampaignService.isDiscountCampaignActive(variant.discountCampaign);
    }

    public isVariantOfTypeBuy(variant: ExtensionVariant): boolean {
        return variant?.type === this.extensionService.EXTENSION_VARIANT_TYPES.BUY;
    }

    public isVariantOfTypeFree(variant: ExtensionVariant): boolean {
        return variant?.type === this.extensionService.EXTENSION_VARIANT_TYPES.FREE;
    }

    public isVariantOfTypeRent(variant: ExtensionVariant): boolean {
        return variant?.type === this.extensionService.EXTENSION_VARIANT_TYPES.RENT;
    }
}
