<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$users = User::all();
foreach ($users as $u) {
    echo "ID: {$u->id}, Username: {$u->username}, Employee ID: {$u->employee_id}, Lazy Employee: " . ($u->employee ? $u->employee->full_name : 'None') . "\n";
}
