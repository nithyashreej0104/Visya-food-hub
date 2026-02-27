const router = require("express").Router();
const db = require("../connection.js");

const VALID_CATEGORIES = ["burger", "pizza", "pasta", "fries"];

// Public list for customer pages
router.get("/", (req, res) => {
  db.query("SELECT * FROM menu_items WHERE status='available' ORDER BY item_id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Admin list (includes unavailable items too)
router.get("/admin", (req, res) => {
  db.query("SELECT * FROM menu_items ORDER BY item_id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Add a menu item
router.post("/", (req, res) => {
  const { name, description, category, price, image_url, status } = req.body;

  if (!name || !description || !category || price === undefined || !image_url) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }

  db.query("SELECT item_id FROM menu_items WHERE LOWER(name)=LOWER(?) LIMIT 1", [name], (dupErr, dupRows) => {
    if (dupErr) return res.status(500).json({ error: "Failed to validate item name" });
    if (dupRows && dupRows.length > 0) {
      return res.status(400).json({ error: "Item already exists" });
    }

  const itemStatus = status === "unavailable" ? "unavailable" : "available";

  const sql = `
    INSERT INTO menu_items (name, description, category, price, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.query(sql, [name, description, category, parsedPrice, image_url, itemStatus], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ message: "Menu item added successfully", item_id: result.insertId });
    });
  });
});

// Update menu item details
router.put("/:id", (req, res) => {
  const itemId = Number(req.params.id);
  const { name, description, category, price, image_url } = req.body;

  if (Number.isNaN(itemId) || itemId <= 0) {
    return res.status(400).json({ error: "Invalid item id" });
  }

  if (!name || !description || !category || price === undefined || !image_url) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }

  const sql = `
    UPDATE menu_items
    SET name=?, category=?, price=?, image_url=?, description=?
    WHERE item_id=?
  `;

  db.query(sql, [name, category, parsedPrice, image_url, description, itemId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update menu item" });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    db.query("SELECT * FROM menu_items WHERE item_id=?", [itemId], (fetchErr, rows) => {
      if (fetchErr) return res.status(500).json({ error: "Menu item updated but failed to fetch updated row" });
      return res.json({
        message: "Menu item updated successfully",
        item: rows && rows[0] ? rows[0] : null
      });
    });
  });
});

// Delete a menu item
router.delete("/:id", (req, res) => {
  const itemId = Number(req.params.id);

  if (Number.isNaN(itemId) || itemId <= 0) {
    return res.status(400).json({ error: "Invalid item id" });
  }

  db.query("DELETE FROM menu_items WHERE item_id=?", [itemId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  });
});

// Update menu item availability status
router.put("/:id/status", (req, res) => {
  const itemId = Number(req.params.id);
  const { status } = req.body;

  if (Number.isNaN(itemId) || itemId <= 0) {
    return res.status(400).json({ error: "Invalid item id" });
  }

  if (status !== "available" && status !== "unavailable") {
    return res.status(400).json({ error: "Status must be 'available' or 'unavailable'" });
  }

  db.query("UPDATE menu_items SET status=? WHERE item_id=?", [status, itemId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update menu item status" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item status updated successfully" });
  });
});

module.exports = router;
