import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

import { books, members, borrowings, users, resetCodes, resetTokens, nextId, deriveBorrowing } from "./data.js";
import { hashPassword, verifyPassword, signToken, toPublicUser, requireAuth } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(express.json());

const auth = requireAuth(users);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function availableCopies(book) {
  const activeCount = borrowings.filter((b) => b.bookId === book.id && !b.returnedAt).length;
  return Math.max(0, book.totalCopies - activeCount);
}

function withAvailability(book) {
  return { ...book, availableCopies: availableCopies(book) };
}

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function isValidPassword(pw) {
  return typeof pw === "string" && PASSWORD_RE.test(pw);
}

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and a number" });
  }
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const user = {
    id: nextId("user"),
    name,
    email,
    passwordHash: hashPassword(password),
    phone: null,
    membershipType: "REGULAR",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  users.push(user);

  const token = signToken(user.id);
  res.status(201).json({ token, user: toPublicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());

  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id);
  res.json({ token, user: toPublicUser(user) });
});

app.post("/api/auth/request-password-reset", (req, res) => {
  const { email } = req.body || {};
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const code = String(crypto.randomInt(100000, 999999));
  resetCodes.set(user.email.toLowerCase(), { code, expiresAt: Date.now() + 15 * 60 * 1000 });

  // NOTE: This demo has no email provider wired up, so the code is returned
  // directly in the response (and logged) instead of being emailed. Replace
  // this with a real email service before using in production.
  console.log(`[password-reset] code for ${user.email}: ${code}`);
  res.json({ message: "Reset code sent to email", devCode: code });
});

app.post("/api/auth/verify-reset-code", (req, res) => {
  const { email, code } = req.body || {};
  const entry = resetCodes.get((email || "").toLowerCase());

  if (!entry || entry.code !== code || entry.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired verification code" });
  }

  const token = crypto.randomBytes(24).toString("hex");
  resetTokens.set(token, { email: email.toLowerCase(), expiresAt: Date.now() + 15 * 60 * 1000 });
  resetCodes.delete(email.toLowerCase());

  res.json({ token, message: "Code verified successfully" });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { email, token, password } = req.body || {};
  const entry = resetTokens.get(token);

  if (!entry || entry.email !== (email || "").toLowerCase() || entry.expiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid reset token or expired" });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 8 characters with uppercase, lowercase, and a number" });
  }

  const user = users.find((u) => u.email.toLowerCase() === entry.email);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.passwordHash = hashPassword(password);
  resetTokens.delete(token);
  res.json({ message: "Password reset successfully" });
});

app.post("/api/auth/change-password", auth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = users.find((u) => u.id === req.userId);

  if (!verifyPassword(currentPassword || "", user.passwordHash)) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: "Invalid password format" });
  }

  user.passwordHash = hashPassword(newPassword);
  res.json({ message: "Password changed successfully" });
});

app.put("/api/users/profile", auth, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  const { name, email, phone } = req.body || {};

  if (email && email.toLowerCase() !== user.email.toLowerCase() && users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ message: "Email already in use" });
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;

  res.json(toPublicUser(user));
});

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

app.get("/api/books", (req, res) => {
  const { search, genre, available } = req.query;
  let result = books.map(withAvailability);

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q)
    );
  }
  if (genre) {
    result = result.filter((b) => b.genre === genre);
  }
  if (available === "true") {
    result = result.filter((b) => b.availableCopies > 0);
  }

  res.json(result);
});

app.post("/api/books", (req, res) => {
  const { title, author, isbn, genre, publishedYear, totalCopies, description } = req.body || {};
  if (!title || !author || !isbn || !genre || !totalCopies) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const book = {
    id: nextId("book"),
    title,
    author,
    isbn,
    genre,
    publishedYear: publishedYear || new Date().getFullYear(),
    totalCopies: Number(totalCopies),
    description: description || "",
    borrowCount: 0,
  };
  books.push(book);
  res.status(201).json(withAvailability(book));
});

app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(withAvailability(book));
});

app.put("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });

  Object.assign(book, req.body || {});
  res.json(withAvailability(book));
});

app.delete("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);
  const hasActive = borrowings.some((b) => b.bookId === id && !b.returnedAt);
  if (hasActive) {
    return res.status(400).json({ error: "Cannot delete a book with active borrowings" });
  }

  const index = books.findIndex((b) => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  books.splice(index, 1);
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

app.get("/api/members", (req, res) => {
  const { search, status, membershipType } = req.query;
  let result = [...members];

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }
  if (status) result = result.filter((m) => m.status === status);
  if (membershipType) result = result.filter((m) => m.membershipType === membershipType);

  res.json(result);
});

app.post("/api/members", (req, res) => {
  const { name, email, phone, membershipType } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const member = {
    id: nextId("member"),
    name,
    email,
    phone: phone || "",
    membershipType: membershipType || "standard",
    status: "active",
    joinDate: new Date().toISOString(),
  };
  members.push(member);
  res.status(201).json(member);
});

app.get("/api/members/:id", (req, res) => {
  const member = members.find((m) => m.id === Number(req.params.id));
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

app.put("/api/members/:id", (req, res) => {
  const member = members.find((m) => m.id === Number(req.params.id));
  if (!member) return res.status(404).json({ error: "Member not found" });

  Object.assign(member, req.body || {});
  res.json(member);
});

app.delete("/api/members/:id", (req, res) => {
  const id = Number(req.params.id);
  const hasActive = borrowings.some((b) => b.memberId === id && !b.returnedAt);
  if (hasActive) {
    return res.status(400).json({ error: "Cannot delete a member with active loans" });
  }

  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Member not found" });

  members.splice(index, 1);
  res.status(204).end();
});

app.get("/api/members/:id/borrowings", (req, res) => {
  const id = Number(req.params.id);
  const result = borrowings
    .filter((b) => b.memberId === id)
    .map(deriveBorrowing)
    .sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));
  res.json(result);
});

// ---------------------------------------------------------------------------
// Borrowings
// ---------------------------------------------------------------------------

app.get("/api/borrowings", (req, res) => {
  const { bookId, status } = req.query;
  let result = borrowings.map(deriveBorrowing);

  if (bookId) result = result.filter((b) => b.bookId === Number(bookId));
  if (status) result = result.filter((b) => b.status === status);

  result.sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));
  res.json(result);
});

app.post("/api/borrowings", (req, res) => {
  const { memberId, bookId, dueDays } = req.body || {};
  const book = books.find((b) => b.id === Number(bookId));
  const member = members.find((m) => m.id === Number(memberId));

  if (!book) return res.status(400).json({ error: "Book not found" });
  if (!member) return res.status(400).json({ error: "Member not found" });
  if (member.status !== "active") return res.status(400).json({ error: "Member is not active" });
  if (availableCopies(book) <= 0) return res.status(400).json({ error: "No available copies of this book" });

  const days = Number(dueDays) > 0 ? Number(dueDays) : 14;
  const borrowing = {
    id: nextId("borrowing"),
    bookId: book.id,
    memberId: member.id,
    borrowedAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    returnedAt: null,
    finePaid: false,
  };
  borrowings.push(borrowing);
  book.borrowCount = (book.borrowCount || 0) + 1;

  res.status(201).json(deriveBorrowing(borrowing));
});

app.post("/api/borrowings/:id/return", (req, res) => {
  const borrowing = borrowings.find((b) => b.id === Number(req.params.id));
  if (!borrowing) return res.status(404).json({ error: "Borrowing not found" });
  if (borrowing.returnedAt) return res.status(400).json({ error: "Already returned" });

  borrowing.returnedAt = new Date().toISOString();
  res.json(deriveBorrowing(borrowing));
});

app.post("/api/borrowings/:id/waive-fine", (req, res) => {
  const borrowing = borrowings.find((b) => b.id === Number(req.params.id));
  if (!borrowing) return res.status(404).json({ error: "Borrowing not found" });

  borrowing.finePaid = true;
  res.json(deriveBorrowing(borrowing));
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

app.get("/api/dashboard/stats", (req, res) => {
  const derived = borrowings.map(deriveBorrowing);
  const totalOutstandingFines = derived.reduce((sum, b) => sum + (b.fineAmount || 0), 0);
  const today = new Date().toDateString();
  const returnedToday = derived.filter((b) => b.returnedAt && new Date(b.returnedAt).toDateString() === today).length;

  res.json({
    totalBooks: books.length,
    availableBooks: books.reduce((sum, b) => sum + availableCopies(b), 0),
    totalMembers: members.length,
    activeBorrowings: derived.filter((b) => b.status === "active" || b.status === "overdue").length,
    returnedToday,
    totalOutstandingFines: Number(totalOutstandingFines.toFixed(2)),
    overdueCount: derived.filter((b) => b.status === "overdue").length,
  });
});

app.get("/api/dashboard/popular-books", (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const result = [...books]
    .sort((a, b) => (b.borrowCount || 0) - (a.borrowCount || 0))
    .slice(0, limit)
    .map(withAvailability);
  res.json(result);
});

app.get("/api/dashboard/overdue", (req, res) => {
  const result = borrowings
    .map(deriveBorrowing)
    .filter((b) => b.status === "overdue")
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  res.json(result);
});

app.get("/api/dashboard/recent-activity", (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const result = borrowings
    .map(deriveBorrowing)
    .sort((a, b) => {
      const aDate = new Date(a.returnedAt || a.borrowedAt).getTime();
      const bDate = new Date(b.returnedAt || b.borrowedAt).getTime();
      return bDate - aDate;
    })
    .slice(0, limit);
  res.json(result);
});

// ---------------------------------------------------------------------------
// Static frontend (production)
// ---------------------------------------------------------------------------

if (isProd) {
  const distDir = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(distDir));
  // SPA fallback for client-side routing — avoids regex route syntax so
  // this behaves the same across Express versions.
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distDir, "index.html"));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}${isProd ? " (serving built frontend)" : ""}`);
});
