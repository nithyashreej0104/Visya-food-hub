const router = require("express").Router();
const db = require("../connection.js");

router.post("/", (req, res) => {
  // accept both 'date' and 'booking_date' from client
  const { name, email, phone, persons, date, booking_date } = req.body;
  const bookingDate = date || booking_date; // prefer date field sent by front-end

  if (!name || !email || !phone || !persons || !bookingDate) {
    return res.status(400).json({ error: 'Missing required booking fields' });
  }

  const sql = `
    INSERT INTO table_booking (name,email,phone,persons,booking_date)
    VALUES (?,?,?,?,?)
  `;

  db.query(sql, [name, email, phone, persons, bookingDate], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Booking saved successfully" });
  });
});

// new endpoint to fetch all bookings (for admin/testing purposes)
router.get("/", (req, res) => {
  const sql = "SELECT * FROM table_booking ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.delete("/:id", (req, res) => {
  const bookingId = Number(req.params.id);

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: "Invalid booking id" });
  }

  db.query("DELETE FROM table_booking WHERE booking_id=?", [bookingId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete booking" });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    return res.json({ message: "Booking deleted successfully" });
  });
});

module.exports = router;
