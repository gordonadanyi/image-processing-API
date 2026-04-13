# Image Processing API

A fast and scalable image processing API built with Node.js, Express, and Sharp. Similar to Cloudinary but self-hosted.

## Features

- **User Authentication**: Signup, Login, Refresh Token, JWT protection
- **Image Upload**: Secure upload with size limits and file validation
- **Image Management**: List, view, and delete user's images
- **On-the-fly Transformations**: Resize, crop, rotate, flip, mirror, grayscale, sepia, format conversion, quality control
- **Text Watermark**: Add custom text watermark to images
- **Clean Architecture**: Service layer, proper validation, and error handling
- **Production Ready**: Rate limiting, security headers, compression

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Sharp (for image processing)
- JWT Authentication
- Multer (file upload)

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd image_API

2. Install dependencies:
npm install

3. Create .env file:
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/image-processing-api
JWT_SECRET=your_super_long_secret_key
REFRESH_SECRET=your_another_long_secret_key
NODE_ENV=development

4. Start the server:
npm run dev

### API Endpoints

### Authentication

POST /api/auth/signup — Create new user
POST /api/auth/login — Login and get tokens
POST /api/auth/refresh-token — Refresh access token
POST /api/auth/logout — Logout

### Images
POST /api/images/upload — Upload image (requires auth)
GET /api/images — List all user's images
GET /api/images/:id — Get original image
GET /api/images/:id/transform — Transform image with query params
DELETE /api/images/:id — Delete image

### Transformation Examples
# Resize + Grayscale
GET /api/images/{id}/transform?resize=800x600&grayscale=true

# Watermark + Rotate
GET /api/images/{id}/transform?watermark=MyBrand&rotate=90

# Multiple transformations
GET /api/images/{id}/transform?resize=700x500&sepia=true&format=webp&quality=80

### Authentication
All image endpoints require a valid JWT token in the header:
Authorization: Bearer <your_access_token>
