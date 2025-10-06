const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination - field name:', file.fieldname);
    // Create a temporary uploads directory, we'll move the file later based on document type
    const uploadPath = path.join('uploads', 'temp');

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log('Multer filename - req.user:', req.user);
    // Generate unique filename: userId_timestamp.ext (we'll rename later)
    const ext = path.extname(file.originalname);
    const userId = req.user ? req.user.id : 'unknown';
    const filename = `${userId}_${Date.now()}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  // Allow specific file types for documents
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer instance for documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = {
  uploadDocument: uploadDocument.single('document')
};