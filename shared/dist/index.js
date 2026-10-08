"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLoginSchema = exports.CreateOrderRequestSchema = exports.QuoteResponseSchema = exports.QuoteRequestSchema = exports.SettingsSchema = exports.OrderSchema = exports.OrderItemSchema = exports.OrderItemSnapshotSchema = exports.PaymentMethodEnum = exports.DeliveryZoneEnum = exports.PaymentStatusEnum = exports.OrderStatusEnum = exports.CouponSchema = exports.ComboSchema = exports.ComboItemSchema = void 0;
const zod_1 = require("zod");
exports.ComboItemSchema = zod_1.z.object({
    id: zod_1.z.number(),
    combo_id: zod_1.z.number(),
    name_bn: zod_1.z.string(),
    name_en: zod_1.z.string(),
    qty_label: zod_1.z.string(),
    market_price: zod_1.z.number(),
    price: zod_1.z.number(),
    sort_order: zod_1.z.number(),
});
exports.ComboSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name_bn: zod_1.z.string(),
    name_en: zod_1.z.string(),
    tag_bn: zod_1.z.string().nullable(),
    tag_en: zod_1.z.string().nullable(),
    serves: zod_1.z.string().nullable(),
    weight_label: zod_1.z.string().nullable(),
    image_url: zod_1.z.string().nullable(),
    market_price: zod_1.z.number(),
    price: zod_1.z.number(),
    is_active: zod_1.z.boolean().or(zod_1.z.number()),
    sort_order: zod_1.z.number(),
    created_at: zod_1.z.string().or(zod_1.z.date()),
    updated_at: zod_1.z.string().or(zod_1.z.date()),
    items: zod_1.z.array(exports.ComboItemSchema).optional(),
});
exports.CouponSchema = zod_1.z.object({
    id: zod_1.z.number(),
    code: zod_1.z.string(),
    type: zod_1.z.enum(['fixed', 'percent']),
    value: zod_1.z.number(),
    min_order_amount: zod_1.z.number(),
    max_discount_amount: zod_1.z.number().nullable(),
    usage_limit: zod_1.z.number().nullable(),
    used_count: zod_1.z.number(),
    starts_at: zod_1.z.string().or(zod_1.z.date()).nullable(),
    expires_at: zod_1.z.string().or(zod_1.z.date()).nullable(),
    is_active: zod_1.z.boolean().or(zod_1.z.number()),
    created_at: zod_1.z.string().or(zod_1.z.date()),
    updated_at: zod_1.z.string().or(zod_1.z.date()),
});
exports.OrderStatusEnum = zod_1.z.enum(['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']);
exports.PaymentStatusEnum = zod_1.z.enum(['unpaid', 'paid']);
exports.DeliveryZoneEnum = zod_1.z.enum(['inside_dhaka', 'outside_dhaka']);
exports.PaymentMethodEnum = zod_1.z.enum(['cod', 'bkash', 'nagad']);
exports.OrderItemSnapshotSchema = zod_1.z.object({
    nameBn: zod_1.z.string(),
    nameEn: zod_1.z.string(),
    qtyLabel: zod_1.z.string(),
    marketPrice: zod_1.z.number(),
    price: zod_1.z.number(),
});
exports.OrderItemSchema = zod_1.z.object({
    id: zod_1.z.number(),
    order_id: zod_1.z.number(),
    combo_id: zod_1.z.number().nullable(),
    name_bn: zod_1.z.string(),
    name_en: zod_1.z.string(),
    items_snapshot: zod_1.z.array(exports.OrderItemSnapshotSchema),
    market_price: zod_1.z.number(),
    unit_price: zod_1.z.number(),
    quantity: zod_1.z.number(),
    line_total: zod_1.z.number(),
});
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.number(),
    order_no: zod_1.z.string(),
    public_token: zod_1.z.string(),
    customer_name: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().nullable(),
    division: zod_1.z.string(),
    district: zod_1.z.string(),
    area: zod_1.z.string(),
    address: zod_1.z.string(),
    delivery_note: zod_1.z.string().nullable(),
    delivery_slot: zod_1.z.string().nullable(),
    delivery_zone: exports.DeliveryZoneEnum,
    payment_method: exports.PaymentMethodEnum,
    payment_sender_number: zod_1.z.string().nullable(),
    payment_txn_id: zod_1.z.string().nullable(),
    payment_status: exports.PaymentStatusEnum,
    order_status: exports.OrderStatusEnum,
    subtotal: zod_1.z.number(),
    delivery_charge: zod_1.z.number(),
    coupon_id: zod_1.z.number().nullable(),
    coupon_code: zod_1.z.string().nullable(),
    discount_amount: zod_1.z.number(),
    grand_total: zod_1.z.number(),
    created_at: zod_1.z.string().or(zod_1.z.date()),
    updated_at: zod_1.z.string().or(zod_1.z.date()),
    items: zod_1.z.array(exports.OrderItemSchema).optional(),
});
exports.SettingsSchema = zod_1.z.object({
    delivery_charge_inside_dhaka: zod_1.z.number().catch(60),
    delivery_charge_outside_dhaka: zod_1.z.number().catch(120),
    free_delivery_min_amount: zod_1.z.number().catch(5000),
    site_phone: zod_1.z.string().catch(''),
    site_whatsapp: zod_1.z.string().catch(''),
    site_email: zod_1.z.string().catch(''),
    site_address_bn: zod_1.z.string().catch(''),
    site_address_en: zod_1.z.string().catch(''),
    bkash_number: zod_1.z.string().catch(''),
    nagad_number: zod_1.z.string().catch(''),
    hero_image_url: zod_1.z.string().catch(''),
    hero_title_bn: zod_1.z.string().catch(''),
    hero_title_en: zod_1.z.string().catch(''),
    hero_subtitle_bn: zod_1.z.string().catch(''),
    hero_subtitle_en: zod_1.z.string().catch(''),
    invoice_policy_note_bn: zod_1.z.string().catch(''),
    invoice_policy_note_en: zod_1.z.string().catch(''),
    delivery_time_slots: zod_1.z.array(zod_1.z.string()).catch([]),
});
exports.QuoteRequestSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        comboId: zod_1.z.number(),
        quantity: zod_1.z.number().min(1).max(20),
    })).min(1).max(20),
    couponCode: zod_1.z.string().optional(),
    deliveryZone: exports.DeliveryZoneEnum,
});
exports.QuoteResponseSchema = zod_1.z.object({
    lines: zod_1.z.array(zod_1.z.object({
        comboId: zod_1.z.number(),
        unitPrice: zod_1.z.number(),
        marketPrice: zod_1.z.number(),
        quantity: zod_1.z.number(),
        lineTotal: zod_1.z.number(),
    })),
    subtotal: zod_1.z.number(),
    deliveryCharge: zod_1.z.number(),
    freeDeliveryRemaining: zod_1.z.number(),
    discountAmount: zod_1.z.number(),
    grandTotal: zod_1.z.number(),
    couponError: zod_1.z.string().optional(),
    appliedCoupon: zod_1.z.string().optional(),
});
exports.CreateOrderRequestSchema = zod_1.z.object({
    customer_name: zod_1.z.string().min(1),
    phone: zod_1.z.string().regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number'),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    division: zod_1.z.string().min(1),
    district: zod_1.z.string().min(1),
    area: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    delivery_note: zod_1.z.string().optional(),
    delivery_slot: zod_1.z.string().optional(),
    delivery_zone: exports.DeliveryZoneEnum,
    payment_method: exports.PaymentMethodEnum,
    payment_sender_number: zod_1.z.string().optional(),
    payment_txn_id: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        comboId: zod_1.z.number(),
        quantity: zod_1.z.number().min(1).max(20),
    })).min(1).max(20),
    coupon_code: zod_1.z.string().optional(),
}).refine(data => {
    if (data.delivery_zone === 'inside_dhaka' && data.district.toLowerCase() !== 'dhaka') {
        return false;
    }
    return true;
}, {
    message: "Inside Dhaka delivery zone is only valid for Dhaka district",
    path: ["delivery_zone"]
}).refine(data => {
    if (['bkash', 'nagad'].includes(data.payment_method)) {
        return !!data.payment_sender_number && !!data.payment_txn_id;
    }
    return true;
}, {
    message: "Payment sender number and transaction ID are required for bKash and Nagad",
    path: ["payment_method"]
});
exports.AdminLoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1),
});
