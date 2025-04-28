import { HttpInterceptorFn } from '@angular/common/http';

export const multipartInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.body instanceof FormData) {
    // For multipart/form-data, let the browser handle the Content-Type
    const headers = req.headers
      .delete('Content-Type')  // Remove any existing Content-Type
      .append('Accept', 'application/json');
      
    req = req.clone({
      headers: headers,
      withCredentials: true  // Enable credentials for CORS
    });
  }
  
  return next(req);
}; 