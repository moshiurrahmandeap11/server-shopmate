import { createOrderItemTable } from "../models/order_items_table.js";
import { createOrdersTable } from "../models/orders_table.js";
import { createPaymentsTable } from "../models/payments_table.js";
import { createProductReviewsTable } from "../models/product_reviews_table.js";
import { createProductsTable } from "../models/products_table.js";
import { createShippingInfoTable } from "../models/shippinginfo_table.js";
import { createUserTable } from "../models/user_table.js";

export const createTables = async() => {
    try {
    await createUserTable();
    await createProductsTable();
    await createOrdersTable();
    await createOrderItemTable();
    await createShippingInfoTable();
    await createPaymentsTable();
    await createProductReviewsTable();
        console.log("All tables created successfully");
    } catch (error) {
        console.error("Error creating tables", error);
        
    }
}