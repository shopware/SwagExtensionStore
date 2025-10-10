import type { ShopwareDiscountCampaignService } from 'src/app/service/discount-campaign.service';
import type { ExtensionVariant } from 'src/module/sw-extension/service/extension-store-action.service';
import type ShopwareExtensionService from 'src/module/sw-extension/service/shopware-extension.service';

const { Utils } = Shopware;

export default class ExtensionStoreService {
    public readonly EXTENSION_RENT_DURATIONS = {
        MONTHLY: 1,
        YEARLY: 12,
    };

    constructor(
        private readonly discountCampaignService: ShopwareDiscountCampaignService,
        private readonly extensionService: ShopwareExtensionService,
    ) {
    }

    public orderVariantsByPricePerMonth(variants: ExtensionVariant[]): ExtensionVariant[] {
        return variants.toSorted((first, second) => {
            const firstPrice = this.getPriceFromVariant(first, true);
            const secondPrice = this.getPriceFromVariant(second, true);

            return firstPrice - secondPrice;
        });
    }

    public orderVariantsByRentDuration(variants: ExtensionVariant[]): ExtensionVariant[] {
        if (variants.length === 1) {
            return variants;
        }

        return variants.toSorted((first, second) => {
            if (!first.duration || !second.duration) {
                return 0;
            }

            return first.duration - second.duration;
        });
    }

    public getCalculatedPrice(variant: ExtensionVariant): string {
        const perMonth = this.isVariantOfTypeRent(variant);
        const price = this.getPriceFromVariant(variant, perMonth);

        return Utils.format.currency(price, 'EUR', 2);
    }

    public getCalculatedPriceSnippet(variants: ExtensionVariant[]): string {
        if (variants.length > 1) {
            return 'sw-extension-store.general.labelFromPricePerMonth';
        }

        const recommendedVariant = this.getRecommendedVariant(variants);

        return this.getPriceSnippetForVariant(recommendedVariant);
    }

    public getPriceSnippetForVariant(variant: ExtensionVariant): string {
        if (this.isVariantOfTypeBuy(variant)) {
            return 'sw-extension-store.general.labelPriceOneTime';
        }

        return 'sw-extension-store.general.labelPricePerMonth';
    }

    public getPriceFromVariant(variant: ExtensionVariant, perMonth = false): number {
        if (this.isVariantDiscounted(variant)) {
            return perMonth ? variant?.discountCampaign.discountedPricePerMonth : variant?.discountCampaign.discountedPrice;
        }

        let price = 0;

        if (perMonth && (variant as ExtensionVariant & { netPricePerMonth: number })?.netPricePerMonth) {
            price = (variant as ExtensionVariant & { netPricePerMonth: number }).netPricePerMonth;
        } else if (variant?.netPrice) {
            price = variant.netPrice;
        }

        return price;
    }

    public getRecommendedVariant(variants: ExtensionVariant[]): ExtensionVariant {
        if (variants.length === 1) {
            return variants[0];
        }

        return this.orderVariantsByPricePerMonth(variants)[0];
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
            !variant ||
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

    public isRentDurationMonthly(variant: ExtensionVariant): boolean {
        return variant?.duration === this.EXTENSION_RENT_DURATIONS.MONTHLY;
    }

    public isRentDurationYearly(variant: ExtensionVariant): boolean {
        return variant?.duration === this.EXTENSION_RENT_DURATIONS.YEARLY;
    }
}
