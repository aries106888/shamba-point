<?php
/**
 * ShambaPoint — XAMPP Entry Point
 *
 * This file serves the built React SPA from frontend/dist/
 * when the project is accessed via XAMPP at:
 *   http://localhost/Small-Farmers/
 *
 * The React app uses hash-based routing (#/home, #/dashboard etc.)
 * so all navigation is handled client-side — Apache just needs
 * to deliver this one HTML file.
 */

$distIndex = __DIR__ . '/frontend/dist/index.html';

if (!file_exists($distIndex)) {
    // ── Build hasn't been run yet ────────────────────────────────
    http_response_code(503);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShambaPoint — Setup Required</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#060f09;color:#e8f5e9;
         display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
    .card{max-width:520px;border:1px solid rgba(132,204,22,.2);border-radius:16px;
          padding:2.5rem;background:rgba(10,20,12,.8);text-align:center}
    h1{font-size:1.6rem;margin-bottom:1rem;color:#a3e635}
    p{color:#9ca3af;font-size:.9rem;line-height:1.6;margin-bottom:1rem}
    code{background:#111;padding:.25rem .6rem;border-radius:6px;
         font-family:monospace;font-size:.85rem;color:#a3e635;display:block;
         margin:.6rem 0;border:1px solid rgba(132,204,22,.15)}
    .step{text-align:left;margin:.4rem 0;font-size:.85rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>🌱 ShambaPoint</h1>
    <p>The React frontend has not been built yet.<br>
       Run the following command in your project terminal:</p>
    <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code>
    <p>Then refresh this page to launch the platform.</p>
    <p style="color:#6b7280;font-size:.8rem;margin-top:1.5rem">
      Database: make sure the shambapoint schema is imported via phpMyAdmin
      using <strong>backend/database/schema.sql</strong>
    </p>
  </div>
</body>
</html>';
    exit;
}

// ── Serve the built React app ────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
// Cache control — instruct the browser to always revalidate
header('Cache-Control: no-cache, must-revalidate');

readfile($distIndex);
