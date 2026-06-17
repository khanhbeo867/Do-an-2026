<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Employee;

$employees = Employee::all();
echo "Total employees in DB: " . $employees->count() . "\n";
foreach ($employees as $e) {
    echo "ID: {$e->id}, Code: {$e->employee_code}, Name: {$e->full_name}, UserID: {$e->user_id}\n";
}
