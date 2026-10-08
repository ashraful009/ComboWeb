import { z } from 'zod';
export declare const ComboItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    combo_id: z.ZodNumber;
    name_bn: z.ZodString;
    name_en: z.ZodString;
    qty_label: z.ZodString;
    market_price: z.ZodNumber;
    price: z.ZodNumber;
    sort_order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    combo_id: number;
    name_bn: string;
    name_en: string;
    qty_label: string;
    market_price: number;
    price: number;
    sort_order: number;
}, {
    id: number;
    combo_id: number;
    name_bn: string;
    name_en: string;
    qty_label: string;
    market_price: number;
    price: number;
    sort_order: number;
}>;
export declare const ComboSchema: z.ZodObject<{
    id: z.ZodNumber;
    name_bn: z.ZodString;
    name_en: z.ZodString;
    tag_bn: z.ZodNullable<z.ZodString>;
    tag_en: z.ZodNullable<z.ZodString>;
    serves: z.ZodNullable<z.ZodString>;
    weight_label: z.ZodNullable<z.ZodString>;
    image_url: z.ZodNullable<z.ZodString>;
    market_price: z.ZodNumber;
    price: z.ZodNumber;
    is_active: z.ZodUnion<[z.ZodBoolean, z.ZodNumber]>;
    sort_order: z.ZodNumber;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        combo_id: z.ZodNumber;
        name_bn: z.ZodString;
        name_en: z.ZodString;
        qty_label: z.ZodString;
        market_price: z.ZodNumber;
        price: z.ZodNumber;
        sort_order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        combo_id: number;
        name_bn: string;
        name_en: string;
        qty_label: string;
        market_price: number;
        price: number;
        sort_order: number;
    }, {
        id: number;
        combo_id: number;
        name_bn: string;
        name_en: string;
        qty_label: string;
        market_price: number;
        price: number;
        sort_order: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    name_bn: string;
    name_en: string;
    market_price: number;
    price: number;
    sort_order: number;
    tag_bn: string | null;
    tag_en: string | null;
    serves: string | null;
    weight_label: string | null;
    image_url: string | null;
    is_active: number | boolean;
    created_at: string | Date;
    updated_at: string | Date;
    items?: {
        id: number;
        combo_id: number;
        name_bn: string;
        name_en: string;
        qty_label: string;
        market_price: number;
        price: number;
        sort_order: number;
    }[] | undefined;
}, {
    id: number;
    name_bn: string;
    name_en: string;
    market_price: number;
    price: number;
    sort_order: number;
    tag_bn: string | null;
    tag_en: string | null;
    serves: string | null;
    weight_label: string | null;
    image_url: string | null;
    is_active: number | boolean;
    created_at: string | Date;
    updated_at: string | Date;
    items?: {
        id: number;
        combo_id: number;
        name_bn: string;
        name_en: string;
        qty_label: string;
        market_price: number;
        price: number;
        sort_order: number;
    }[] | undefined;
}>;
export declare const CouponSchema: z.ZodObject<{
    id: z.ZodNumber;
    code: z.ZodString;
    type: z.ZodEnum<["fixed", "percent"]>;
    value: z.ZodNumber;
    min_order_amount: z.ZodNumber;
    max_discount_amount: z.ZodNullable<z.ZodNumber>;
    usage_limit: z.ZodNullable<z.ZodNumber>;
    used_count: z.ZodNumber;
    starts_at: z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    expires_at: z.ZodNullable<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    is_active: z.ZodUnion<[z.ZodBoolean, z.ZodNumber]>;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    value: number;
    code: string;
    type: "fixed" | "percent";
    is_active: number | boolean;
    created_at: string | Date;
    updated_at: string | Date;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    starts_at: string | Date | null;
    expires_at: string | Date | null;
}, {
    id: number;
    value: number;
    code: string;
    type: "fixed" | "percent";
    is_active: number | boolean;
    created_at: string | Date;
    updated_at: string | Date;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    starts_at: string | Date | null;
    expires_at: string | Date | null;
}>;
export declare const OrderStatusEnum: z.ZodEnum<["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]>;
export declare const PaymentStatusEnum: z.ZodEnum<["unpaid", "paid"]>;
export declare const DeliveryZoneEnum: z.ZodEnum<["inside_dhaka", "outside_dhaka"]>;
export declare const PaymentMethodEnum: z.ZodEnum<["cod", "bkash", "nagad"]>;
export declare const OrderItemSnapshotSchema: z.ZodObject<{
    nameBn: z.ZodString;
    nameEn: z.ZodString;
    qtyLabel: z.ZodString;
    marketPrice: z.ZodNumber;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    price: number;
    nameBn: string;
    nameEn: string;
    qtyLabel: string;
    marketPrice: number;
}, {
    price: number;
    nameBn: string;
    nameEn: string;
    qtyLabel: string;
    marketPrice: number;
}>;
export declare const OrderItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    order_id: z.ZodNumber;
    combo_id: z.ZodNullable<z.ZodNumber>;
    name_bn: z.ZodString;
    name_en: z.ZodString;
    items_snapshot: z.ZodArray<z.ZodObject<{
        nameBn: z.ZodString;
        nameEn: z.ZodString;
        qtyLabel: z.ZodString;
        marketPrice: z.ZodNumber;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        price: number;
        nameBn: string;
        nameEn: string;
        qtyLabel: string;
        marketPrice: number;
    }, {
        price: number;
        nameBn: string;
        nameEn: string;
        qtyLabel: string;
        marketPrice: number;
    }>, "many">;
    market_price: z.ZodNumber;
    unit_price: z.ZodNumber;
    quantity: z.ZodNumber;
    line_total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
    combo_id: number | null;
    name_bn: string;
    name_en: string;
    market_price: number;
    order_id: number;
    items_snapshot: {
        price: number;
        nameBn: string;
        nameEn: string;
        qtyLabel: string;
        marketPrice: number;
    }[];
    unit_price: number;
    quantity: number;
    line_total: number;
}, {
    id: number;
    combo_id: number | null;
    name_bn: string;
    name_en: string;
    market_price: number;
    order_id: number;
    items_snapshot: {
        price: number;
        nameBn: string;
        nameEn: string;
        qtyLabel: string;
        marketPrice: number;
    }[];
    unit_price: number;
    quantity: number;
    line_total: number;
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodNumber;
    order_no: z.ZodString;
    public_token: z.ZodString;
    customer_name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    division: z.ZodString;
    district: z.ZodString;
    area: z.ZodString;
    address: z.ZodString;
    delivery_note: z.ZodNullable<z.ZodString>;
    delivery_slot: z.ZodNullable<z.ZodString>;
    delivery_zone: z.ZodEnum<["inside_dhaka", "outside_dhaka"]>;
    payment_method: z.ZodEnum<["cod", "bkash", "nagad"]>;
    payment_sender_number: z.ZodNullable<z.ZodString>;
    payment_txn_id: z.ZodNullable<z.ZodString>;
    payment_status: z.ZodEnum<["unpaid", "paid"]>;
    order_status: z.ZodEnum<["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]>;
    subtotal: z.ZodNumber;
    delivery_charge: z.ZodNumber;
    coupon_id: z.ZodNullable<z.ZodNumber>;
    coupon_code: z.ZodNullable<z.ZodString>;
    discount_amount: z.ZodNumber;
    grand_total: z.ZodNumber;
    created_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    updated_at: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        order_id: z.ZodNumber;
        combo_id: z.ZodNullable<z.ZodNumber>;
        name_bn: z.ZodString;
        name_en: z.ZodString;
        items_snapshot: z.ZodArray<z.ZodObject<{
            nameBn: z.ZodString;
            nameEn: z.ZodString;
            qtyLabel: z.ZodString;
            marketPrice: z.ZodNumber;
            price: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }, {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }>, "many">;
        market_price: z.ZodNumber;
        unit_price: z.ZodNumber;
        quantity: z.ZodNumber;
        line_total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        combo_id: number | null;
        name_bn: string;
        name_en: string;
        market_price: number;
        order_id: number;
        items_snapshot: {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }[];
        unit_price: number;
        quantity: number;
        line_total: number;
    }, {
        id: number;
        combo_id: number | null;
        name_bn: string;
        name_en: string;
        market_price: number;
        order_id: number;
        items_snapshot: {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }[];
        unit_price: number;
        quantity: number;
        line_total: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    order_no: string;
    public_token: string;
    customer_name: string;
    phone: string;
    email: string | null;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_note: string | null;
    delivery_slot: string | null;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    payment_sender_number: string | null;
    payment_txn_id: string | null;
    payment_status: "unpaid" | "paid";
    order_status: "pending" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
    subtotal: number;
    delivery_charge: number;
    coupon_id: number | null;
    coupon_code: string | null;
    discount_amount: number;
    grand_total: number;
    items?: {
        id: number;
        combo_id: number | null;
        name_bn: string;
        name_en: string;
        market_price: number;
        order_id: number;
        items_snapshot: {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }[];
        unit_price: number;
        quantity: number;
        line_total: number;
    }[] | undefined;
}, {
    id: number;
    created_at: string | Date;
    updated_at: string | Date;
    order_no: string;
    public_token: string;
    customer_name: string;
    phone: string;
    email: string | null;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_note: string | null;
    delivery_slot: string | null;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    payment_sender_number: string | null;
    payment_txn_id: string | null;
    payment_status: "unpaid" | "paid";
    order_status: "pending" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled";
    subtotal: number;
    delivery_charge: number;
    coupon_id: number | null;
    coupon_code: string | null;
    discount_amount: number;
    grand_total: number;
    items?: {
        id: number;
        combo_id: number | null;
        name_bn: string;
        name_en: string;
        market_price: number;
        order_id: number;
        items_snapshot: {
            price: number;
            nameBn: string;
            nameEn: string;
            qtyLabel: string;
            marketPrice: number;
        }[];
        unit_price: number;
        quantity: number;
        line_total: number;
    }[] | undefined;
}>;
export declare const SettingsSchema: z.ZodObject<{
    delivery_charge_inside_dhaka: z.ZodCatch<z.ZodNumber>;
    delivery_charge_outside_dhaka: z.ZodCatch<z.ZodNumber>;
    free_delivery_min_amount: z.ZodCatch<z.ZodNumber>;
    site_phone: z.ZodCatch<z.ZodString>;
    site_whatsapp: z.ZodCatch<z.ZodString>;
    site_email: z.ZodCatch<z.ZodString>;
    site_address_bn: z.ZodCatch<z.ZodString>;
    site_address_en: z.ZodCatch<z.ZodString>;
    bkash_number: z.ZodCatch<z.ZodString>;
    nagad_number: z.ZodCatch<z.ZodString>;
    hero_image_url: z.ZodCatch<z.ZodString>;
    hero_title_bn: z.ZodCatch<z.ZodString>;
    hero_title_en: z.ZodCatch<z.ZodString>;
    hero_subtitle_bn: z.ZodCatch<z.ZodString>;
    hero_subtitle_en: z.ZodCatch<z.ZodString>;
    invoice_policy_note_bn: z.ZodCatch<z.ZodString>;
    invoice_policy_note_en: z.ZodCatch<z.ZodString>;
    delivery_time_slots: z.ZodCatch<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    delivery_charge_inside_dhaka: number;
    delivery_charge_outside_dhaka: number;
    free_delivery_min_amount: number;
    site_phone: string;
    site_whatsapp: string;
    site_email: string;
    site_address_bn: string;
    site_address_en: string;
    bkash_number: string;
    nagad_number: string;
    hero_image_url: string;
    hero_title_bn: string;
    hero_title_en: string;
    hero_subtitle_bn: string;
    hero_subtitle_en: string;
    invoice_policy_note_bn: string;
    invoice_policy_note_en: string;
    delivery_time_slots: string[];
}, {
    delivery_charge_inside_dhaka?: unknown;
    delivery_charge_outside_dhaka?: unknown;
    free_delivery_min_amount?: unknown;
    site_phone?: unknown;
    site_whatsapp?: unknown;
    site_email?: unknown;
    site_address_bn?: unknown;
    site_address_en?: unknown;
    bkash_number?: unknown;
    nagad_number?: unknown;
    hero_image_url?: unknown;
    hero_title_bn?: unknown;
    hero_title_en?: unknown;
    hero_subtitle_bn?: unknown;
    hero_subtitle_en?: unknown;
    invoice_policy_note_bn?: unknown;
    invoice_policy_note_en?: unknown;
    delivery_time_slots?: unknown;
}>;
export declare const QuoteRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        comboId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        comboId: number;
    }, {
        quantity: number;
        comboId: number;
    }>, "many">;
    couponCode: z.ZodOptional<z.ZodString>;
    deliveryZone: z.ZodEnum<["inside_dhaka", "outside_dhaka"]>;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    deliveryZone: "inside_dhaka" | "outside_dhaka";
    couponCode?: string | undefined;
}, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    deliveryZone: "inside_dhaka" | "outside_dhaka";
    couponCode?: string | undefined;
}>;
export declare const QuoteResponseSchema: z.ZodObject<{
    lines: z.ZodArray<z.ZodObject<{
        comboId: z.ZodNumber;
        unitPrice: z.ZodNumber;
        marketPrice: z.ZodNumber;
        quantity: z.ZodNumber;
        lineTotal: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        marketPrice: number;
        quantity: number;
        comboId: number;
        unitPrice: number;
        lineTotal: number;
    }, {
        marketPrice: number;
        quantity: number;
        comboId: number;
        unitPrice: number;
        lineTotal: number;
    }>, "many">;
    subtotal: z.ZodNumber;
    deliveryCharge: z.ZodNumber;
    freeDeliveryRemaining: z.ZodNumber;
    discountAmount: z.ZodNumber;
    grandTotal: z.ZodNumber;
    couponError: z.ZodOptional<z.ZodString>;
    appliedCoupon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    subtotal: number;
    lines: {
        marketPrice: number;
        quantity: number;
        comboId: number;
        unitPrice: number;
        lineTotal: number;
    }[];
    deliveryCharge: number;
    freeDeliveryRemaining: number;
    discountAmount: number;
    grandTotal: number;
    couponError?: string | undefined;
    appliedCoupon?: string | undefined;
}, {
    subtotal: number;
    lines: {
        marketPrice: number;
        quantity: number;
        comboId: number;
        unitPrice: number;
        lineTotal: number;
    }[];
    deliveryCharge: number;
    freeDeliveryRemaining: number;
    discountAmount: number;
    grandTotal: number;
    couponError?: string | undefined;
    appliedCoupon?: string | undefined;
}>;
export declare const CreateOrderRequestSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    customer_name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    division: z.ZodString;
    district: z.ZodString;
    area: z.ZodString;
    address: z.ZodString;
    delivery_note: z.ZodOptional<z.ZodString>;
    delivery_slot: z.ZodOptional<z.ZodString>;
    delivery_zone: z.ZodEnum<["inside_dhaka", "outside_dhaka"]>;
    payment_method: z.ZodEnum<["cod", "bkash", "nagad"]>;
    payment_sender_number: z.ZodOptional<z.ZodString>;
    payment_txn_id: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        comboId: z.ZodNumber;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        comboId: number;
    }, {
        quantity: number;
        comboId: number;
    }>, "many">;
    coupon_code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}>, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}>, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}, {
    items: {
        quantity: number;
        comboId: number;
    }[];
    customer_name: string;
    phone: string;
    division: string;
    district: string;
    area: string;
    address: string;
    delivery_zone: "inside_dhaka" | "outside_dhaka";
    payment_method: "cod" | "bkash" | "nagad";
    email?: string | undefined;
    delivery_note?: string | undefined;
    delivery_slot?: string | undefined;
    payment_sender_number?: string | undefined;
    payment_txn_id?: string | undefined;
    coupon_code?: string | undefined;
}>;
export declare const AdminLoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type ComboItem = z.infer<typeof ComboItemSchema>;
export type Combo = z.infer<typeof ComboSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type AdminLoginRequest = z.infer<typeof AdminLoginSchema>;
