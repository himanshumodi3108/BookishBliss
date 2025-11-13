const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;
const { validateBook } = require('./middleware/validation');
const { verifyToken, verifyAdmin } = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generatePaytmParams, verifyPaytmCallback, PAYTM_ENABLE } = require('./utils/paytm');
const { generateToken } = require('./utils/jwt');
const bcrypt = require('bcryptjs');

// CORS configuration
const getAllowedOrigins = () => {
    const origins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000'
    ];
    
    // Add frontend URL from environment variable
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }
    
    // Add production URLs
    origins.push('https://bookish-bliss-six.vercel.app');
    origins.push('https://bookishbliss.onrender.com');
    
    return origins;
};

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = getAllowedOrigins();
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

// middleware 
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// mongodb config here
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

//  console.log('MongoDB URI:', uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')); // Log URI without credentials

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    maxPoolSize: 10, // Optimize for deployment
    socketTimeoutMS: 45000, // Handle slow connections
    connectTimeoutMS: 10000 // Connection timeout
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const db = client.db("BookInventory");
        const bookCollections = db.collection("books");
        const orderCollections = db.collection("orders");
        const reviewCollections = db.collection("reviews");
        const wishlistCollections = db.collection("wishlist");
        const userCollections = db.collection("users");
        const authUsersCollections = db.collection("authUsers"); // For JWT-based users
        const sellerRequestCollections = db.collection("sellerRequests");
        const sellersCollections = db.collection("sellers"); // Store seller information

        // insert a book to db: Post Method (Protected - Admin or Seller)
        app.post("/upload-book", verifyToken, validateBook, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                
                // Check if user is admin - check multiple ways
                let isAdmin = false;
                
                // Check admin flag in user object (for JWT users)
                if (req.user.admin === true) {
                    isAdmin = true;
                }
                
                // Check admin email list (works for both JWT and Firebase)
                const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).filter(e => e) : [];
                const userEmail = req.user.email || req.user.user?.email;
                if (adminEmails.length > 0 && userEmail && adminEmails.includes(userEmail)) {
                    isAdmin = true;
                }
                
                // Check if user is an approved seller
                const seller = await sellersCollections.findOne({ userId, status: 'active' });
                const isSeller = !!seller;
                
                if (!isAdmin && !isSeller) {
                    return res.status(403).json({ error: 'Forbidden: Only admins and approved sellers can upload books' });
                }

            const data = req.body;
                data.createdAt = new Date();
                data.updatedAt = new Date();
                
                // If seller (not admin), set sellerId - approved sellers can upload directly without approval
                if (isSeller && !isAdmin) {
                    data.sellerId = userId;
                }
                
            const result = await bookCollections.insertOne(data);
                res.status(201).json({ 
                    success: true, 
                    message: 'Book uploaded successfully',
                    data: result 
                });
            } catch (error) {
                console.error('Error uploading book:', error);
                res.status(500).json({ error: 'Failed to upload book', message: error.message });
            }
        })

        //get all books from db
        // app.get("/all-books", async (req, res) => {
        //     const books = bookCollections.find();
        //     const result = await books.toArray();
        //     res.send(result)
        // })

        // Get seller's books (Protected - Seller only)
        app.get("/books/seller", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 12;
                const skip = (page - 1) * limit;

                // Check if user is a seller
                const seller = await sellersCollections.findOne({ userId, status: 'active' });
                if (!seller) {
                    return res.status(403).json({ error: 'Forbidden: You are not an approved seller' });
                }

                const query = { sellerId: userId };
                const total = await bookCollections.countDocuments(query);

                const books = await bookCollections
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                res.json({
                    books,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                });
            } catch (error) {
                console.error('Error fetching seller books:', error);
                res.status(500).json({ error: 'Failed to fetch books', message: error.message });
            }
        });

        // get all books with pagination, search, and filtering
        app.get("/all-books", async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 12;
                const skip = (page - 1) * limit;
                const category = req.query.category;
                const search = req.query.search;
                const sortBy = req.query.sortBy || 'createdAt';
                const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

            let query = {};
                
                // Filter by category
                if (category) {
                    query.category = category;
                }

                // Search functionality
                if (search) {
                    query.$or = [
                        { bookTitle: { $regex: search, $options: 'i' } },
                        { authorName: { $regex: search, $options: 'i' } },
                        { bookDescription: { $regex: search, $options: 'i' } }
                    ];
                }

                // Get total count for pagination
                const total = await bookCollections.countDocuments(query);

                // Fetch books with pagination and sorting
                const books = await bookCollections
                    .find(query)
                    .sort({ [sortBy]: sortOrder })
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                res.json({
                    books,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                });
            } catch (error) {
                console.error('Error fetching books:', error);
                res.status(500).json({ error: 'Failed to fetch books', message: error.message });
            }
        })

        // update a books method (Protected - Admin or Seller who owns the book)
        app.patch("/book/:id", verifyToken, validateBook, async (req, res) => {
            try {
            const id = req.params.id;
                const userId = req.user.uid || req.user.userId;
                
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid book ID' });
                }

                // Check if book exists and get it
                const book = await bookCollections.findOne({ _id: new ObjectId(id) });
                if (!book) {
                    return res.status(404).json({ error: 'Book not found' });
                }

                // Check if user is admin - check multiple ways
                let isAdmin = false;
                
                // Check admin flag in user object (for JWT users)
                if (req.user.admin === true) {
                    isAdmin = true;
                }
                
                // Check admin email list (works for both JWT and Firebase)
                const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).filter(e => e) : [];
                const userEmail = req.user.email || req.user.user?.email;
                if (adminEmails.length > 0 && userEmail && adminEmails.includes(userEmail)) {
                    isAdmin = true;
                }
                
                // Check if user is the seller who owns this book
                const isOwner = book.sellerId && book.sellerId === userId;
                
                // Admins can edit any book, sellers can only edit their own
                if (!isAdmin && !isOwner) {
                    return res.status(403).json({ error: 'Forbidden: You can only edit your own books' });
                }

            const updateBookData = req.body;
                updateBookData.updatedAt = new Date();
                
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                    $set: updateBookData
                };

                const result = await bookCollections.updateOne(filter, updatedDoc);

                res.json({ 
                    success: true, 
                    message: 'Book updated successfully',
                    data: result 
                });
            } catch (error) {
                console.error('Error updating book:', error);
                res.status(500).json({ error: 'Failed to update book', message: error.message });
            }
        })

        // delete a item from db (Protected - Admin or Seller who owns the book)
        app.delete("/book/:id", verifyToken, async (req, res) => {
            try {
            const id = req.params.id;
                const userId = req.user.uid || req.user.userId;
                
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid book ID' });
                }

                // Check if book exists and get it
                const book = await bookCollections.findOne({ _id: new ObjectId(id) });
                if (!book) {
                    return res.status(404).json({ error: 'Book not found' });
                }

                // Check if user is admin - check multiple ways
                let isAdmin = false;
                
                // Check admin flag in user object (for JWT users)
                if (req.user.admin === true) {
                    isAdmin = true;
                }
                
                // Check admin email list (works for both JWT and Firebase)
                const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).filter(e => e) : [];
                const userEmail = req.user.email || req.user.user?.email;
                if (adminEmails.length > 0 && userEmail && adminEmails.includes(userEmail)) {
                    isAdmin = true;
                }
                
                // Check if user is the seller who owns this book
                const isOwner = book.sellerId && book.sellerId === userId;
                
                // Admins can delete any book, sellers can only delete their own
                if (!isAdmin && !isOwner) {
                    return res.status(403).json({ error: 'Forbidden: You can only delete your own books' });
                }

            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.deleteOne(filter);

                res.json({ 
                    success: true, 
                    message: 'Book deleted successfully',
                    data: result 
                });
            } catch (error) {
                console.error('Error deleting book:', error);
                res.status(500).json({ error: 'Failed to delete book', message: error.message });
            }
        })

        // get a single book data
        app.get("/book/:id", async (req, res) => {
            try {
            const id = req.params.id;
                
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid book ID' });
                }

            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.findOne(filter);

                if (!result) {
                    return res.status(404).json({ error: 'Book not found' });
                }

                res.json(result);
            } catch (error) {
                console.error('Error fetching book:', error);
                res.status(500).json({ error: 'Failed to fetch book', message: error.message });
            }
        })

        // ========== ORDERS ENDPOINTS ==========
        
        // Create order
        app.post("/orders", verifyToken, async (req, res) => {
            try {
                const { items, shippingAddress, totalAmount } = req.body;
                const userId = req.user.uid || req.user.userId;
                const userEmail = req.user.email;

                if (!items || !Array.isArray(items) || items.length === 0) {
                    return res.status(400).json({ error: 'Order items are required' });
                }

                const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9);
                
                const order = {
                    orderId,
                    userId,
                    userEmail,
                    items,
                    shippingAddress,
                    totalAmount,
                    status: 'pending',
                    paymentStatus: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await orderCollections.insertOne(order);

                // Generate payment params if Paytm is enabled
                if (PAYTM_ENABLE) {
                    const paymentParams = await generatePaytmParams(
                        orderId,
                        totalAmount,
                        userId,
                        userEmail,
                        shippingAddress?.phone || ''
                    );
                    return res.json({
                        success: true,
                        orderId,
                        order: result,
                        paymentParams,
                        paymentUrl: 'https://securegw-stage.paytm.in/theia/processTransaction'
                    });
                } else {
                    // Direct payment (no gateway)
                    await orderCollections.updateOne(
                        { _id: result.insertedId },
                        { $set: { paymentStatus: 'paid', status: 'confirmed' } }
                    );
                    return res.json({
                        success: true,
                        orderId,
                        order: result,
                        message: 'Order placed successfully! Payment completed directly.'
                    });
                }
            } catch (error) {
                console.error('Error creating order:', error);
                res.status(500).json({ error: 'Failed to create order', message: error.message });
            }
        });

        // Get user orders
        app.get("/orders", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const orders = await orderCollections.find({ userId }).sort({ createdAt: -1 }).toArray();
                res.json(orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
            }
        });

        // Get single order
        app.get("/orders/:orderId", verifyToken, async (req, res) => {
            try {
                const { orderId } = req.params;
                const userId = req.user.uid || req.user.userId;
                const order = await orderCollections.findOne({ orderId, userId });
                
                if (!order) {
                    return res.status(404).json({ error: 'Order not found' });
                }
                
                res.json(order);
            } catch (error) {
                console.error('Error fetching order:', error);
                res.status(500).json({ error: 'Failed to fetch order', message: error.message });
            }
        });

        // Paytm payment callback
        app.post("/payment/callback", async (req, res) => {
            try {
                const verification = await verifyPaytmCallback(req.body);
                
                if (verification.verified && verification.status === 'TXN_SUCCESS') {
                    await orderCollections.updateOne(
                        { orderId: verification.orderId },
                        { 
                            $set: { 
                                paymentStatus: 'paid',
                                status: 'confirmed',
                                transactionId: verification.transactionId,
                                updatedAt: new Date()
                            } 
                        }
                    );
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${verification.orderId}`);
                } else {
                    await orderCollections.updateOne(
                        { orderId: verification.orderId },
                        { 
                            $set: { 
                                paymentStatus: 'failed',
                                status: 'cancelled',
                                updatedAt: new Date()
                            } 
                        }
                    );
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?orderId=${verification.orderId}`);
                }
            } catch (error) {
                console.error('Error processing payment callback:', error);
                res.status(500).json({ error: 'Payment verification failed', message: error.message });
            }
        });

        // ========== REVIEWS ENDPOINTS ==========

        // Create review
        app.post("/reviews", verifyToken, async (req, res) => {
            try {
                const { bookId, rating, comment } = req.body;
                const userId = req.user.uid || req.user.userId;
                const userEmail = req.user.email;

                if (!bookId || !rating || rating < 1 || rating > 5) {
                    return res.status(400).json({ error: 'Valid bookId and rating (1-5) are required' });
                }

                // Check if user already reviewed this book
                const existingReview = await reviewCollections.findOne({ bookId, userId });
                if (existingReview) {
                    return res.status(400).json({ error: 'You have already reviewed this book' });
                }

                const review = {
                    bookId,
                    userId,
                    userEmail,
                    rating: parseInt(rating),
                    comment: comment || '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await reviewCollections.insertOne(review);
                res.status(201).json({ success: true, review: result });
            } catch (error) {
                console.error('Error creating review:', error);
                res.status(500).json({ error: 'Failed to create review', message: error.message });
            }
        });

        // Get reviews for a book
        app.get("/reviews/book/:bookId", async (req, res) => {
            try {
                const { bookId } = req.params;
                const reviews = await reviewCollections.find({ bookId }).sort({ createdAt: -1 }).toArray();
                
                // Calculate average rating
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : 0;

                res.json({ reviews, averageRating: avgRating.toFixed(1), totalReviews: reviews.length });
            } catch (error) {
                console.error('Error fetching reviews:', error);
                res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
            }
        });

        // Get user reviews
        app.get("/reviews/user", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const reviews = await reviewCollections.find({ userId }).sort({ createdAt: -1 }).toArray();
                res.json(reviews);
            } catch (error) {
                console.error('Error fetching user reviews:', error);
                res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
            }
        });

        // Update review
        app.patch("/reviews/:reviewId", verifyToken, async (req, res) => {
            try {
                const { reviewId } = req.params;
                const userId = req.user.uid || req.user.userId;
                const { rating, comment } = req.body;

                const review = await reviewCollections.findOne({ _id: new ObjectId(reviewId), userId });
                if (!review) {
                    return res.status(404).json({ error: 'Review not found' });
                }

                const update = { updatedAt: new Date() };
                if (rating) update.rating = parseInt(rating);
                if (comment !== undefined) update.comment = comment;

                await reviewCollections.updateOne(
                    { _id: new ObjectId(reviewId) },
                    { $set: update }
                );

                res.json({ success: true, message: 'Review updated successfully' });
            } catch (error) {
                console.error('Error updating review:', error);
                res.status(500).json({ error: 'Failed to update review', message: error.message });
            }
        });

        // Delete review
        app.delete("/reviews/:reviewId", verifyToken, async (req, res) => {
            try {
                const { reviewId } = req.params;
                const userId = req.user.uid || req.user.userId;

                const result = await reviewCollections.deleteOne({ _id: new ObjectId(reviewId), userId });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Review not found' });
                }

                res.json({ success: true, message: 'Review deleted successfully' });
            } catch (error) {
                console.error('Error deleting review:', error);
                res.status(500).json({ error: 'Failed to delete review', message: error.message });
            }
        });

        // ========== WISHLIST ENDPOINTS ==========

        // Add to wishlist
        app.post("/wishlist", verifyToken, async (req, res) => {
            try {
                const { bookId } = req.body;
                const userId = req.user.uid || req.user.userId;

                if (!bookId) {
                    return res.status(400).json({ error: 'Book ID is required' });
                }

                // Check if already in wishlist
                const existing = await wishlistCollections.findOne({ bookId, userId });
                if (existing) {
                    return res.status(400).json({ error: 'Book already in wishlist' });
                }

                const wishlistItem = {
                    bookId,
                    userId,
                    createdAt: new Date()
                };

                const result = await wishlistCollections.insertOne(wishlistItem);
                res.status(201).json({ success: true, item: result });
            } catch (error) {
                console.error('Error adding to wishlist:', error);
                res.status(500).json({ error: 'Failed to add to wishlist', message: error.message });
            }
        });

        // Get user wishlist
        app.get("/wishlist", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const wishlist = await wishlistCollections.find({ userId }).sort({ createdAt: -1 }).toArray();
                
                // Get book details for each wishlist item
                const bookIds = wishlist.map(item => new ObjectId(item.bookId));
                const books = await bookCollections.find({ _id: { $in: bookIds } }).toArray();
                
                const wishlistWithBooks = wishlist.map(item => {
                    const book = books.find(b => b._id.toString() === item.bookId);
                    return { ...item, book };
                });

                res.json(wishlistWithBooks);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
                res.status(500).json({ error: 'Failed to fetch wishlist', message: error.message });
            }
        });

        // Remove from wishlist
        app.delete("/wishlist/:bookId", verifyToken, async (req, res) => {
            try {
                const { bookId } = req.params;
                const userId = req.user.uid || req.user.userId;

                const result = await wishlistCollections.deleteOne({ bookId, userId });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: 'Item not found in wishlist' });
                }

                res.json({ success: true, message: 'Removed from wishlist' });
            } catch (error) {
                console.error('Error removing from wishlist:', error);
                res.status(500).json({ error: 'Failed to remove from wishlist', message: error.message });
            }
        });

        // ========== AUTHENTICATION ENDPOINTS (JWT) ==========

        // JWT Signup
        app.post("/auth/signup", async (req, res) => {
            try {
                const { email, password, name } = req.body;

                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                // Check if user already exists
                const existingUser = await authUsersCollections.findOne({ email: email.toLowerCase() });
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists with this email' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create user
                const userData = {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    name: name || '',
                    phone: '',
                    address: {},
                    isAdmin: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await authUsersCollections.insertOne(userData);
                const userId = result.insertedId.toString();

                // Also create in userCollections for consistency
                await userCollections.insertOne({
                    userId,
                    email: email.toLowerCase(),
                    name: name || '',
                    photoURL: '',
                    phone: '',
                    address: {},
                    authProvider: 'jwt',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // Generate JWT token
                const token = generateToken({
                    _id: userId,
                    email: email.toLowerCase(),
                    name: name || '',
                    isAdmin: false
                });

                res.status(201).json({
                    success: true,
                    token,
                    user: {
                        _id: userId,
                        email: email.toLowerCase(),
                        name: name || ''
                    }
                });
            } catch (error) {
                console.error('Error in signup:', error);
                res.status(500).json({ error: 'Failed to create account', message: error.message });
            }
        });

        // JWT Login
        app.post("/auth/login", async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                // Find user
                const user = await authUsersCollections.findOne({ email: email.toLowerCase() });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Update last login
                await authUsersCollections.updateOne(
                    { _id: user._id },
                    { $set: { lastLogin: new Date(), updatedAt: new Date() } }
                );

                // Check if user is admin (check ADMIN_EMAILS environment variable)
                const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
                const isAdmin = adminEmails.includes(user.email.toLowerCase());

                // Ensure user exists in userCollections
                const userId = user._id.toString();
                const existingUser = await userCollections.findOne({ userId });
                
                if (!existingUser) {
                    // Create new user profile
                    await userCollections.insertOne({
                        userId,
                        email: user.email,
                        name: user.name,
                        photoURL: '',
                        phone: user.phone || '',
                        address: user.address || {},
                        authProvider: 'jwt',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                } else {
                    // Update existing user
                    await userCollections.updateOne(
                        { userId },
                        {
                            $set: {
                                email: user.email,
                                name: user.name,
                                lastLogin: new Date(),
                                updatedAt: new Date()
                            }
                        }
                    );
                }

                // Generate JWT token
                const token = generateToken({
                    _id: userId,
                    email: user.email,
                    name: user.name,
                    isAdmin: isAdmin || user.isAdmin || false
                });

                res.json({
                    success: true,
                    token,
                    user: {
                        _id: userId,
                        email: user.email,
                        name: user.name,
                        isAdmin: isAdmin || user.isAdmin || false
                    }
                });
            } catch (error) {
                console.error('Error in login:', error);
                res.status(500).json({ error: 'Failed to login', message: error.message });
            }
        });

        // Firebase login callback - store user in database
        app.post("/auth/firebase-login", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const email = req.user.email || '';
                const name = req.user.name || req.user.displayName || '';
                const photoURL = req.user.picture || req.user.photoURL || '';

                // Check if user already exists
                let existingUser = await userCollections.findOne({ userId });

                // Store/update user in database with complete information
                const userData = {
                    userId,
                    email,
                    name,
                    photoURL,
                    phone: existingUser?.phone || '',
                    address: existingUser?.address || {},
                    authProvider: 'firebase',
                    lastLogin: new Date(),
                    updatedAt: new Date()
                };

                // If user doesn't exist, set createdAt
                if (!existingUser) {
                    userData.createdAt = new Date();
                }

                await userCollections.updateOne(
                    { userId },
                    { $set: userData },
                    { upsert: true }
                );

                // Get the updated user
                const updatedUser = await userCollections.findOne({ userId });

                res.json({
                    success: true,
                    message: 'User data stored successfully',
                    user: updatedUser
                });
            } catch (error) {
                console.error('Error storing Firebase user:', error);
                res.status(500).json({ error: 'Failed to store user data', message: error.message });
            }
        });

        // ========== USER PROFILE ENDPOINTS ==========

        // Get or create user profile
        app.get("/user/profile", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const email = req.user.email || '';
                const name = req.user.name || req.user.displayName || '';
                
                let user = await userCollections.findOne({ userId });

                if (!user) {
                    // Create new user profile in database
                    const userData = {
                        userId,
                        email,
                        name,
                        photoURL: req.user.picture || req.user.photoURL || '',
                        phone: '',
                        address: {},
                        authProvider: req.user.uid ? 'firebase' : 'jwt',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    
                    const result = await userCollections.insertOne(userData);
                    user = { ...userData, _id: result.insertedId };
                } else {
                    // Update last accessed time
                    await userCollections.updateOne(
                        { userId },
                        { $set: { updatedAt: new Date() } }
                    );
                }

                res.json(user);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
            }
        });

        // Update user profile
        app.patch("/user/profile", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const updateData = {
                    ...req.body,
                    updatedAt: new Date()
                };

                // Update in userCollections
                await userCollections.updateOne(
                    { userId },
                    { $set: updateData },
                    { upsert: true }
                );

                // Also update in authUsersCollections if it's a JWT user
                if (req.user.userId && !req.user.uid && ObjectId.isValid(userId)) {
                    try {
                        await authUsersCollections.updateOne(
                            { _id: new ObjectId(userId) },
                            { $set: { ...updateData, updatedAt: new Date() } }
                        );
                    } catch (updateError) {
                        console.error('Error updating authUsers collection:', updateError);
                    }
                }

                res.json({ success: true, message: 'Profile updated successfully' });
            } catch (error) {
                console.error('Error updating profile:', error);
                res.status(500).json({ error: 'Failed to update profile', message: error.message });
            }
        });

        // ========== SELLER REQUEST ENDPOINTS ==========

        // Create seller request (Authenticated users)
        app.post("/seller-requests", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const requestData = {
                    ...req.body,
                    userId,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await sellerRequestCollections.insertOne(requestData);
                res.status(201).json({ 
                    success: true, 
                    message: 'Seller request submitted successfully',
                    requestId: result.insertedId 
                });
            } catch (error) {
                console.error('Error creating seller request:', error);
                res.status(500).json({ error: 'Failed to submit request', message: error.message });
            }
        });

        // Get user's seller requests
        app.get("/seller-requests/my-requests", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                const requests = await sellerRequestCollections
                    .find({ userId })
                    .sort({ createdAt: -1 })
                    .toArray();
                res.json(requests);
            } catch (error) {
                console.error('Error fetching seller requests:', error);
                res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
            }
        });

        // Get all seller requests (Admin only)
        app.get("/seller-requests", verifyToken, verifyAdmin, async (req, res) => {
            try {
                const status = req.query.status; // Optional filter by status
                const query = status ? { status } : {};
                
                const requests = await sellerRequestCollections
                    .find(query)
                    .sort({ createdAt: -1 })
                    .toArray();
                res.json(requests);
            } catch (error) {
                console.error('Error fetching seller requests:', error);
                res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
            }
        });

        // Get single seller request (Admin only)
        app.get("/seller-requests/:id", verifyToken, verifyAdmin, async (req, res) => {
            try {
                const request = await sellerRequestCollections.findOne({ 
                    _id: new ObjectId(req.params.id) 
                });
                
                if (!request) {
                    return res.status(404).json({ error: 'Request not found' });
                }
                
                res.json(request);
            } catch (error) {
                console.error('Error fetching seller request:', error);
                res.status(500).json({ error: 'Failed to fetch request', message: error.message });
            }
        });

        // Approve seller request (Admin only) - Creates book from request and seller profile
        app.post("/seller-requests/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
            try {
                const requestId = req.params.id;
                const request = await sellerRequestCollections.findOne({ 
                    _id: new ObjectId(requestId) 
                });

                if (!request) {
                    return res.status(404).json({ error: 'Request not found' });
                }

                if (request.status !== 'pending') {
                    return res.status(400).json({ error: 'Request is not pending' });
                }

                // Check if seller profile already exists
                let seller = await sellersCollections.findOne({ userId: request.userId });
                
                if (!seller) {
                    // Create seller profile with seller details
                    const sellerData = {
                        userId: request.userId,
                        sellerName: request.sellerName || '',
                        sellerEmail: request.sellerEmail || request.userId,
                        sellerPhone: request.sellerPhone || '',
                        sellerAddress: request.sellerAddress || '',
                        sellerCity: request.sellerCity || '',
                        sellerState: request.sellerState || '',
                        sellerPincode: request.sellerPincode || '',
                        sellerBusinessName: request.sellerBusinessName || '',
                        sellerGSTIN: request.sellerGSTIN || '',
                        status: 'active',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    await sellersCollections.insertOne(sellerData);
                } else {
                    // Update existing seller profile
                    await sellersCollections.updateOne(
                        { userId: request.userId },
                        {
                            $set: {
                                sellerName: request.sellerName || seller.sellerName,
                                sellerEmail: request.sellerEmail || seller.sellerEmail,
                                sellerPhone: request.sellerPhone || seller.sellerPhone,
                                sellerAddress: request.sellerAddress || seller.sellerAddress,
                                sellerCity: request.sellerCity || seller.sellerCity,
                                sellerState: request.sellerState || seller.sellerState,
                                sellerPincode: request.sellerPincode || seller.sellerPincode,
                                sellerBusinessName: request.sellerBusinessName || seller.sellerBusinessName,
                                sellerGSTIN: request.sellerGSTIN || seller.sellerGSTIN,
                                status: 'active',
                                updatedAt: new Date()
                            }
                        }
                    );
                }

                // Create book from request
                const bookData = {
                    bookTitle: request.bookTitle,
                    authorName: request.authorName,
                    category: request.category,
                    bookDescription: request.bookDescription,
                    price: request.price,
                    imageURL: request.imageURL,
                    bookPDFURL: request.bookPDFURL,
                    sellerId: request.userId, // Store seller ID
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const bookResult = await bookCollections.insertOne(bookData);

                // Update request status
                await sellerRequestCollections.updateOne(
                    { _id: new ObjectId(requestId) },
                    { 
                        $set: { 
                            status: 'approved',
                            adminResponse: req.body.adminResponse || 'Request approved. Your book has been added to the store.',
                            approvedAt: new Date(),
                            bookId: bookResult.insertedId,
                            updatedAt: new Date()
                        } 
                    }
                );

                res.json({ 
                    success: true, 
                    message: 'Request approved and book created',
                    bookId: bookResult.insertedId 
                });
            } catch (error) {
                console.error('Error approving seller request:', error);
                res.status(500).json({ error: 'Failed to approve request', message: error.message });
            }
        });

        // Reject seller request (Admin only)
        app.post("/seller-requests/:id/reject", verifyToken, verifyAdmin, async (req, res) => {
            try {
                const requestId = req.params.id;
                const request = await sellerRequestCollections.findOne({ 
                    _id: new ObjectId(requestId) 
                });

                if (!request) {
                    return res.status(404).json({ error: 'Request not found' });
                }

                if (request.status !== 'pending') {
                    return res.status(400).json({ error: 'Request is not pending' });
                }

                await sellerRequestCollections.updateOne(
                    { _id: new ObjectId(requestId) },
                    { 
                        $set: { 
                            status: 'rejected',
                            adminResponse: req.body.adminResponse || 'Request rejected.',
                            rejectedAt: new Date(),
                            updatedAt: new Date()
                        } 
                    }
                );

                res.json({ success: true, message: 'Request rejected' });
            } catch (error) {
                console.error('Error rejecting seller request:', error);
                res.status(500).json({ error: 'Failed to reject request', message: error.message });
            }
        });

        // ========== SELLER STATUS ENDPOINT ==========

        // Check if user is a seller (has approved requests or books)
        app.get("/seller/status", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                
                // Check if user has any approved seller requests
                const approvedRequest = await sellerRequestCollections.findOne({ 
                    userId, 
                    status: 'approved' 
                });
                
                // Check if user has any books with their sellerId
                const sellerBook = await bookCollections.findOne({ sellerId: userId });
                
                const isSeller = !!(approvedRequest || sellerBook);
                
                res.json({ isSeller });
            } catch (error) {
                console.error('Error checking seller status:', error);
                res.status(500).json({ error: 'Failed to check seller status', message: error.message });
            }
        });

        // ========== ANALYTICS ENDPOINTS ==========

        // Seller analytics (for sellers to see their own books' analytics)
        app.get("/analytics/seller", verifyToken, async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                
                // Get seller's books
                const sellerBooks = await bookCollections.find({ sellerId: userId }).toArray();
                const bookIds = sellerBooks.map(book => book._id);

                if (bookIds.length === 0) {
                    return res.json({
                        stats: {
                            totalBooks: 0,
                            totalOrders: 0,
                            totalRevenue: '0.00',
                            totalReviews: 0
                        },
                        books: [],
                        recentOrders: []
                    });
                }

                // Get orders for seller's books
                const orders = await orderCollections.find({
                    'items.bookId': { $in: bookIds.map(id => id.toString()) },
                    paymentStatus: 'paid'
                }).toArray();

                // Calculate stats
                const totalOrders = orders.length;
                const totalRevenue = orders.reduce((sum, order) => {
                    const sellerItems = order.items.filter(item => 
                        bookIds.some(bid => bid.toString() === item.bookId)
                    );
                    const sellerAmount = sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0);
                    return sum + sellerAmount;
                }, 0);

                // Get reviews for seller's books
                const reviews = await reviewCollections.find({
                    bookId: { $in: bookIds.map(id => id.toString()) }
                }).toArray();

                // Get book analytics
                const booksWithAnalytics = await Promise.all(sellerBooks.map(async (book) => {
                    const bookOrders = orders.filter(order =>
                        order.items.some(item => item.bookId === book._id.toString())
                    );
                    const bookReviews = reviews.filter(r => r.bookId === book._id.toString());
                    const avgRating = bookReviews.length > 0
                        ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
                        : null;

                    const orderCount = bookOrders.reduce((sum, order) => {
                        const item = order.items.find(i => i.bookId === book._id.toString());
                        return sum + (item ? item.quantity : 0);
                    }, 0);

                    return {
                        ...book,
                        orderCount,
                        reviewCount: bookReviews.length,
                        avgRating
                    };
                }));

                // Recent orders for seller's books
                const recentOrders = orders
                    .slice(0, 10)
                    .map(order => {
                        const sellerItems = order.items.filter(item =>
                            bookIds.some(bid => bid.toString() === item.bookId)
                        );
                        return sellerItems.map(item => {
                            const book = sellerBooks.find(b => b._id.toString() === item.bookId);
                            return {
                                _id: order._id,
                                bookTitle: book?.bookTitle || 'Unknown',
                                quantity: item.quantity,
                                amount: item.price * item.quantity,
                                createdAt: order.createdAt,
                                paymentStatus: order.paymentStatus
                            };
                        });
                    })
                    .flat()
                    .slice(0, 10);

                res.json({
                    stats: {
                        totalBooks: sellerBooks.length,
                        totalOrders,
                        totalRevenue: totalRevenue.toFixed(2),
                        totalReviews: reviews.length
                    },
                    books: booksWithAnalytics,
                    recentOrders
                });
            } catch (error) {
                console.error('Error fetching seller analytics:', error);
                res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
            }
        });

        // Admin analytics (for all books)
        app.get("/analytics/dashboard", verifyToken, verifyAdmin, async (req, res) => {
            try {
                const totalBooks = await bookCollections.countDocuments();
                const totalOrders = await orderCollections.countDocuments();
                const totalUsers = await userCollections.countDocuments();
                const totalReviews = await reviewCollections.countDocuments();

                // Revenue calculation
                const orders = await orderCollections.find({ paymentStatus: 'paid' }).toArray();
                const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

                // Recent orders
                const recentOrders = await orderCollections.find().sort({ createdAt: -1 }).limit(10).toArray();

                // Popular books (by reviews)
                const popularBooks = await reviewCollections.aggregate([
                    { $group: { _id: '$bookId', avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
                    { $sort: { reviewCount: -1, avgRating: -1 } },
                    { $limit: 10 }
                ]).toArray();

                const bookIds = popularBooks.map(p => new ObjectId(p._id));
                const books = await bookCollections.find({ _id: { $in: bookIds } }).toArray();

                const popularBooksWithDetails = popularBooks.map(p => {
                    const book = books.find(b => b._id.toString() === p._id);
                    return { ...p, book };
                });

                res.json({
                    stats: {
                        totalBooks,
                        totalOrders,
                        totalUsers,
                        totalReviews,
                        totalRevenue: totalRevenue.toFixed(2)
                    },
                    recentOrders,
                    popularBooks: popularBooksWithDetails
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
                res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
            }
        });

        // ========== IMAGE UPLOAD ENDPOINT ==========

        app.post("/upload-image", verifyToken, upload.single('image'), async (req, res) => {
            try {
                const userId = req.user.uid || req.user.userId;
                
                // Check if user is admin or seller
                const isAdmin = req.user.admin === true || 
                              (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.split(',').map(e => e.trim()).includes(req.user.email));
                
                const seller = await sellersCollections.findOne({ userId, status: 'active' });
                const isSeller = !!seller;
                
                if (!isAdmin && !isSeller) {
                    return res.status(403).json({ error: 'Forbidden: Only admins and approved sellers can upload images' });
                }

                if (!req.file) {
                    return res.status(400).json({ error: 'No image file provided' });
                }

                const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
                res.json({ success: true, imageUrl });
            } catch (error) {
                console.error('Error uploading image:', error);
                res.status(500).json({ error: 'Failed to upload image', message: error.message });
            }
        });

        //Send a ping to confirm successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`)
})
