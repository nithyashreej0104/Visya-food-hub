const express = require("express");
const router = express.Router();
const db = require("../db");

const VALID_STATUSES = ["pending", "completed", "cancelled"];

router.get("/", async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await db.query(`
        SELECT order_id, customer_name, total_amount, status, created_at
        FROM orders
        ORDER BY created_at DESC
      `);
    } catch (err) {
      if (err && err.code === "ER_BAD_FIELD_ERROR") {
        [rows] = await db.query(`
          SELECT
            order_id,
            customer_name,
            total_amount,
            CASE
              WHEN order_status = 'delivered' THEN 'completed'
              WHEN order_status = 'confirmed' THEN 'cancelled'
              ELSE 'pending'
            END AS status,
            created_at
          FROM orders
          ORDER BY created_at DESC
        `);
      } else {
        throw err;
      }
    }

    res.json(rows);
  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/:id/status", async (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    let result;
    try {
      [result] = await db.query("UPDATE orders SET status=? WHERE order_id=?", [status, orderId]);
    } catch (err) {
      if (err && (err.code === "ER_BAD_FIELD_ERROR" || err.code === "WARN_DATA_TRUNCATED" || err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD")) {
        const mappedStatus =
          status === "completed"
            ? "delivered"
            : status === "cancelled"
              ? "confirmed"
              : "pending";

        [result] = await db.query("UPDATE orders SET order_status=? WHERE order_id=?", [mappedStatus, orderId]);
      } else {
        throw err;
      }
    }

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

module.exports = router;
