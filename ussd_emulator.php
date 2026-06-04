<?php
// ══════════════════════════════════════════════════
//  ShambaPoint USSD Terminal Emulator
//  Allows testing the USSD flow interactively from the terminal.
//  Run this with:
//    php ussd_emulator.php
// ══════════════════════════════════════════════════

echo "\n============================================\n";
echo "    SHAMBAPOINT USSD TERMINAL SIMULATOR\n";
echo "============================================\n\n";

$defaultPhone = "0712345678";
echo "Enter test phone number [$defaultPhone]: ";
$handle = fopen("php://stdin", "r");
$phoneInput = trim(fgets($handle));
$phone = $phoneInput !== "" ? $phoneInput : $defaultPhone;

$sessionId = "term_sess_" . uniqid();
$textAccumulator = "";

echo "\nDialing *384# ...\n";

while (true) {
    // Make call to the local ussd.php endpoint
    // To make it highly robust, we'll execute the script locally using PHP
    // instead of calling via curl, which doesn't require Apache to be set up.
    // However, if they want to run it via local server, we can simulate the request variables.
    
    $_REQUEST['sessionId'] = $sessionId;
    $_REQUEST['phoneNumber'] = $phone;
    $_REQUEST['text'] = $textAccumulator;

    // Capture the output of the ussd api file
    ob_start();
    include __DIR__ . '/backend/api/ussd.php';
    $response = ob_get_clean();

    // Check if it's a CON (continue) or END (exit) response
    if (str_starts_with($response, 'CON ')) {
        $menuText = substr($response, 4);
        echo "\n[USSD Screen]:\n";
        echo "-------------------------------------\n";
        echo $menuText . "\n";
        echo "-------------------------------------\n";
        echo "Enter option / input: ";
        $input = trim(fgets($handle));
        
        if ($textAccumulator === "") {
            $textAccumulator = $input;
        } else {
            $textAccumulator .= "*" . $input;
        }
    } 
    elseif (str_starts_with($response, 'END ')) {
        $endText = substr($response, 4);
        echo "\n[USSD Screen]:\n";
        echo "-------------------------------------\n";
        echo $endText . "\n";
        echo "-------------------------------------\n";
        echo "\nConnection closed. Thank you.\n\n";
        break;
    } 
    else {
        // Fallback for raw text
        echo "\n[USSD Screen]:\n";
        echo "-------------------------------------\n";
        echo $response . "\n";
        echo "-------------------------------------\n";
        break;
    }
}

fclose($handle);
