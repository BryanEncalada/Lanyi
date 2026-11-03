<?php

return ['paths' => ['api/*'], 'allowed_methods' => ['GET', 'POST', 'OPTIONS'], 'allowed_origins' => array_filter(explode(',', env('FRONTEND_ORIGINS', 'http://localhost:4200'))), 'allowed_origins_patterns' => [], 'allowed_headers' => ['Accept', 'Content-Type'], 'exposed_headers' => [], 'max_age' => 3600, 'supports_credentials' => false];
