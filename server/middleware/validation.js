const Joi = require('joi');

const bookSchema = Joi.object({
  bookTitle: Joi.string().required().min(1).max(200).trim(),
  authorName: Joi.string().required().min(1).max(100).trim(),
  imageURL: Joi.string().uri().required().trim(),
  category: Joi.string().required().valid(
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Programming",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Bibliography",
    "Romance",
    "Autobiography",
    "History",
    "Self-help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Religion",
    "Art and Design"
  ),
  bookDescription: Joi.string().required().min(10).max(2000).trim(),
  bookPDFURL: Joi.string().uri().required().trim(),
  price: Joi.number().positive().required().precision(2),
});

const validateBook = (req, res, next) => {
  const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message).join(', ');
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors 
    });
  }
  
  // Replace req.body with validated and sanitized value
  req.body = value;
  next();
};

module.exports = {
  validateBook
};



