const router = require("express").Router();
const db = require("../connection.js");

const VALID_STATUSES = ["pending", "completed", "cancelled", "confirmed"];

router.get("/", (req, res) => {
  const primarySql = `
    SELECT order_id, customer_name, total_amount, status, created_at
    FROM orders
    ORDER BY created_at DESC
  `;

  const fallbackSql = `
    SELECT
      order_id,
      customer_name,
      total_amount,
      CASE
        WHEN order_status = 'delivered' THEN 'completed'
        WHEN order_status = 'cancelled' THEN 'cancelled'
        WHEN order_status = 'confirmed' THEN 'confirmed'
        ELSE 'pending'
      END AS status,
      created_at
    FROM orders
    ORDER BY created_at DESC
  `;

  db.query(primarySql, (err, results) => {
    if (!err) return res.json(results);

    if (err.code === "ER_BAD_FIELD_ERROR") {
      db.query(fallbackSql, (fallbackErr, fallbackResults) => {
        if (fallbackErr) return res.status(500).json({ error: "Failed to fetch orders" });
        return res.json(fallbackResults);
      });
      return;
    }

    return res.status(500).json({ error: "Failed to fetch orders" });
  });
});

router.get("/stats", (req, res) => {
  const primarySql = `
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(total_amount), 0) AS totalRevenue,
      SUM(status = 'pending') AS pendingOrders,
      SUM(status = 'completed') AS completedOrders,
      SUM(status = 'cancelled') AS cancelledOrders,
      SUM(status = 'confirmed') AS confirmedOrders
    FROM orders
  `;

  const fallbackSql = `
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(total_amount), 0) AS totalRevenue,
      SUM(order_status = 'pending') AS pendingOrders,
      SUM(order_status = 'delivered') AS completedOrders,
      SUM(order_status = 'cancelled') AS cancelledOrders,
      SUM(order_status = 'confirmed') AS confirmedOrders
    FROM orders
  `;

  db.query(primarySql, (err, rows) => {
    if (!err) {
      const stats = rows[0] || {};
      return res.json({
        totalOrders: Number(stats.totalOrders || 0),
        totalRevenue: Number(stats.totalRevenue || 0),
        pendingOrders: Number(stats.pendingOrders || 0),
        completedOrders: Number(stats.completedOrders || 0),
        cancelledOrders: Number(stats.cancelledOrders || 0),
        confirmedOrders: Number(stats.confirmedOrders || 0)
      });
    }

    if (err.code === "ER_BAD_FIELD_ERROR") {
      db.query(fallbackSql, (fallbackErr, fallbackRows) => {
        if (fallbackErr) return res.status(500).json({ error: "Failed to fetch order stats" });
        const stats = fallbackRows[0] || {};
        return res.json({
          totalOrders: Number(stats.totalOrders || 0),
          totalRevenue: Number(stats.totalRevenue || 0),
          pendingOrders: Number(stats.pendingOrders || 0),
          completedOrders: Number(stats.completedOrders || 0),
          cancelledOrders: Number(stats.cancelledOrders || 0),
          confirmedOrders: Number(stats.confirmedOrders || 0)
        });
      });
      return;
    }

    return res.status(500).json({ error: "Failed to fetch order stats" });
  });
});

router.get("/:id", (req, res) => {
  const orderId = Number(req.params.id);
  if (Number.isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({ error: "Invalid order id" });
  }

  db.query("SELECT * FROM orders WHERE order_id=?", [orderId], (err, orderRows) => {
    if (err) return res.status(500).json(err);

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    db.query("SELECT * FROM order_items WHERE order_id=?", [orderId], (err2, itemRows) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        order: orderRows[0],
        items: itemRows || []
      });
    });
  });
});

router.post("/", (req, res) => {
  const { name, phone, total, items } = req.body;

  db.query(
    "INSERT INTO orders (customer_name, customer_phone, total_amount) VALUES (?,?,?)",
    [name, phone, total],
    (err, orderResult) => {
      if (err) return res.status(500).json(err);

      const orderId = orderResult.insertId;

      items.forEach(item => {
        db.query(
          "INSERT INTO order_items (order_id,item_id,quantity,price) VALUES (?,?,?,?)",
          [orderId, item.id, item.qty, item.price]
        );
      });

      res.json({ message: "Order placed successfully" });
    }
  );
});

router.put("/:id/status", (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body || {};

  if (Number.isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  db.query("UPDATE orders SET status=? WHERE order_id=?", [status, orderId], (err, result) => {
    if (!err) {
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json({ message: "Order status updated successfully" });
    }

    if (err.code === "ER_BAD_FIELD_ERROR" || err.code === "WARN_DATA_TRUNCATED" || err.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
      const mappedStatus =
        status === "completed"
          ? "delivered"
          : status === "cancelled"
            ? "cancelled"
            : status === "confirmed"
              ? "confirmed"
              : "pending";

      db.query("UPDATE orders SET order_status=? WHERE order_id=?", [mappedStatus, orderId], (fallbackErr, fallbackResult) => {
        if (fallbackErr) return res.status(500).json({ message: "Failed to update order status" });
        if (!fallbackResult || fallbackResult.affectedRows === 0) {
          return res.status(404).json({ message: "Order not found" });
        }
        return res.json({ message: "Order status updated successfully" });
      });
      return;
    }

    return res.status(500).json({ message: "Failed to update order status" });
  });
});

module.exports = router;
