export const IMAGEKIT_CONFIG = {
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  };
  
  
  // Firebase storage bucket configuration
  export const FIREBASE_CONFIG = {
    bucketUrl: import.meta.env.VITE_FIREBASE_BUCKET_URL,
    bucketName: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  };
  
  // Extract file path from Firebase URL and transform for ImageKit
  export function extractFirebasePath(firebaseUrl) {
    if (!firebaseUrl) return firebaseUrl;
  
    try {
      const firebaseBaseRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o/;
    
      if (firebaseUrl.includes('firebasestorage.googleapis.com') && firebaseUrl.includes('/o/')) {
        const transformedUrl = firebaseUrl.replace(
          firebaseBaseRegex,
          IMAGEKIT_CONFIG.urlEndpoint
        );
        
        // console.log('Original URL:', firebaseUrl);
        //console.log('Transformed URL:', transformedUrl);
  
        return transformedUrl;
      }
  
      return firebaseUrl;
    } catch (error) {
      console.error('Error extracting Firebase path:', error);
      return firebaseUrl;
    }
  }
  
  
  // Image transformation presets
  export const IMAGE_TRANSFORMATIONS = {
    avatar: { width: 50, height: 50, quality: 80, format: 'webp' },
    messageImage: { width: 400, quality: 70, format: 'webp' },
    filePreview: { width: 300, quality: 70, format: 'webp' },
    thumbnail: { width: 200, height: 200, quality: 60, format: 'webp' }
  };