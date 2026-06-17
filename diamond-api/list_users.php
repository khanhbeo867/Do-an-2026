<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$userService = $app->make(App\Http\Interfaces\UserServiceInterface::class);
$users = $userService->all(['employee']);

echo "Total users: " . count($users) . "\n";
foreach ($users as $u) {
    echo "ID: {$u['id']}, Username: {$u['username']}, Role: " . (is_string($u['role']) ? $u['role'] : $u['role']->value) . ", EmployeeID: {$u['employee_id']}, Employee: " . (isset($u['employee']) && $u['employee'] ? $u['employee']['full_name'] : 'None') . "\n";
}
