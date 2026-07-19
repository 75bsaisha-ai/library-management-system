// In-memory data store for the Library Management System demo backend.
// Replace this with a real database (Postgres, etc.) for production use —
// data here resets whenever the server restarts.

const DAY_MS = 24 * 60 * 60 * 1000;
const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * DAY_MS).toISOString();

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------
export const books = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", genre: "Fiction", publishedYear: 1988, totalCopies: 4, description: "A shepherd boy's journey to find treasure and discover his personal legend.", borrowCount: 1 },
  { id: 2, title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0141439518", genre: "Classic", publishedYear: 1813, totalCopies: 3, description: "A witty exploration of manners, marriage, and morality in Regency England.", borrowCount: 1 },
  { id: 3, title: "Dune", author: "Frank Herbert", isbn: "978-0441013593", genre: "Sci-Fi", publishedYear: 1965, totalCopies: 5, description: "A sweeping saga of politics, religion, and ecology on the desert planet Arrakis.", borrowCount: 1 },
  { id: 4, title: "Brave New World", author: "Aldous Huxley", isbn: "978-0060850524", genre: "Sci-Fi", publishedYear: 1932, totalCopies: 3, description: "A dystopian vision of a genetically engineered, pleasure-controlled society.", borrowCount: 1 },
  { id: 5, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", genre: "Classic", publishedYear: 1960, totalCopies: 4, description: "A young girl's coming-of-age story set against racial injustice in the Deep South.", borrowCount: 1 },
  { id: 6, title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", genre: "Non-Fiction", publishedYear: 2011, totalCopies: 3, description: "A sweeping history of how Homo sapiens came to dominate the world.", borrowCount: 0 },
  { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0547928227", genre: "Fantasy", publishedYear: 1937, totalCopies: 4, description: "Bilbo Baggins is swept into an epic quest to reclaim a dwarven kingdom.", borrowCount: 0 },
  { id: 8, title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Classic", publishedYear: 1949, totalCopies: 5, description: "A chilling portrait of a totalitarian surveillance state.", borrowCount: 0 },
  { id: 9, title: "Educated", author: "Tara Westover", isbn: "978-0399590504", genre: "Non-Fiction", publishedYear: 2018, totalCopies: 2, description: "A memoir of self-invention through education against extraordinary odds.", borrowCount: 0 },
  { id: 10, title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "978-0756404741", genre: "Fantasy", publishedYear: 2007, totalCopies: 3, description: "The legendary tale of Kvothe, told in his own words.", borrowCount: 0 },
];

// ---------------------------------------------------------------------------
// Members (library patrons — distinct from staff login accounts in users.js)
// ---------------------------------------------------------------------------
export const members = [
  { id: 1, name: "Henry Brown", email: "henry.brown@example.com", phone: "555-0101", membershipType: "premium", status: "active", joinDate: daysAgo(400) },
  { id: 2, name: "Carol White", email: "carol.white@example.com", phone: "555-0102", membershipType: "standard", status: "active", joinDate: daysAgo(320) },
  { id: 3, name: "Marcus Lee", email: "marcus.lee@example.com", phone: "555-0103", membershipType: "student", status: "active", joinDate: daysAgo(180) },
  { id: 4, name: "Priya Patel", email: "priya.patel@example.com", phone: "555-0104", membershipType: "standard", status: "active", joinDate: daysAgo(90) },
  { id: 5, name: "Diego Alvarez", email: "diego.alvarez@example.com", phone: "555-0105", membershipType: "premium", status: "active", joinDate: daysAgo(600) },
  { id: 6, name: "Sofia Kim", email: "sofia.kim@example.com", phone: "555-0106", membershipType: "student", status: "suspended", joinDate: daysAgo(250) },
  { id: 7, name: "James O'Connor", email: "james.oconnor@example.com", phone: "555-0107", membershipType: "standard", status: "expired", joinDate: daysAgo(720) },
  { id: 8, name: "Amara Okafor", email: "amara.okafor@example.com", phone: "555-0108", membershipType: "premium", status: "active", joinDate: daysAgo(45) },
];

// ---------------------------------------------------------------------------
// Borrowings (mix of active, overdue, returned)
// ---------------------------------------------------------------------------
export const borrowings = [
  { id: 1, bookId: 4, memberId: 1, borrowedAt: daysAgo(20), dueAt: daysAgo(6), returnedAt: null, finePaid: false },
  { id: 2, bookId: 1, memberId: 2, borrowedAt: daysAgo(18), dueAt: daysAgo(4), returnedAt: null, finePaid: false },
  { id: 3, bookId: 3, memberId: 3, borrowedAt: daysAgo(5), dueAt: daysFromNow(9), returnedAt: null, finePaid: false },
  { id: 4, bookId: 5, memberId: 4, borrowedAt: daysAgo(3), dueAt: daysFromNow(11), returnedAt: null, finePaid: false },
  { id: 5, bookId: 2, memberId: 5, borrowedAt: daysAgo(2), dueAt: daysFromNow(12), returnedAt: null, finePaid: false },
  { id: 6, bookId: 6, memberId: 1, borrowedAt: daysAgo(40), dueAt: daysAgo(26), returnedAt: daysAgo(28), finePaid: true },
  { id: 7, bookId: 7, memberId: 2, borrowedAt: daysAgo(35), dueAt: daysAgo(21), returnedAt: daysAgo(25), finePaid: true },
  { id: 8, bookId: 8, memberId: 3, borrowedAt: daysAgo(15), dueAt: daysFromNow(-1), returnedAt: daysAgo(1), finePaid: false },
];

// ---------------------------------------------------------------------------
// Staff / login accounts (separate from patron "members" above)
// ---------------------------------------------------------------------------
export const users = [];

// ---------------------------------------------------------------------------
// Password-reset flow (demo-only, in-memory)
// ---------------------------------------------------------------------------
export const resetCodes = new Map(); // email -> { code, expiresAt }
export const resetTokens = new Map(); // token -> { email, expiresAt }

// ---------------------------------------------------------------------------
// Id counters
// ---------------------------------------------------------------------------
export const counters = {
  book: books.length,
  member: members.length,
  borrowing: borrowings.length,
  user: 0,
};

export function nextId(kind) {
  counters[kind] += 1;
  return counters[kind];
}

const FINE_PER_DAY = 0.25;

/** Returns a borrowing enriched with a live status + fine calculation. */
export function deriveBorrowing(b) {
  const nowMs = Date.now();
  const due = new Date(b.dueAt).getTime();
  let status = "active";
  let fineAmount = 0;

  if (b.returnedAt) {
    status = "returned";
    const returnedMs = new Date(b.returnedAt).getTime();
    if (returnedMs > due) {
      const daysLate = Math.ceil((returnedMs - due) / DAY_MS);
      fineAmount = b.finePaid ? 0 : Number((daysLate * FINE_PER_DAY).toFixed(2));
    }
  } else if (nowMs > due) {
    status = "overdue";
    const daysLate = Math.ceil((nowMs - due) / DAY_MS);
    fineAmount = b.finePaid ? 0 : Number((daysLate * FINE_PER_DAY).toFixed(2));
  }

  const book = books.find((bk) => bk.id === b.bookId);
  const member = members.find((m) => m.id === b.memberId);

  return {
    ...b,
    status,
    fineAmount,
    book: book ? { id: book.id, title: book.title, author: book.author } : undefined,
    member: member ? { id: member.id, name: member.name, email: member.email } : undefined,
  };
}
