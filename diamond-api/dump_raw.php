<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Employee;

$u = User::find(2);
$e = Employee::find(4);

echo "USER 2 RAW:\n";
print_r($u ? $u->toArray() : "NULL");
echo "\nEMPLOYEE 4 RAW:\n";
print_r($e ? $e->toArray() : "NULL");

echo "\nRELATION ATTEMPT:\n";
if ($u) {
    echo "Employee name: " . ($u->employee ? $u->employee->full_name : "NULL") . "\n";
}
