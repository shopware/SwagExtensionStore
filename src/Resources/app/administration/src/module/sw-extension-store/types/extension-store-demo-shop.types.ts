type DemoShopContact = {
    firstName: string;
    lastName: string;
};

type DemoShopInformation = {
    remainingDays: number;
    expirationDate: string;
    accountLink: string;
    contact: DemoShopContact | null;
};

type DemoShopStatus =
    | { isDemoShop: true; demoShopInformation: DemoShopInformation }
    | { isDemoShop: false; demoShopInformation: null };

export type {
    DemoShopContact,
    DemoShopInformation,
    DemoShopStatus,
};
