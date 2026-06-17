<?php

namespace App\Http\Services;

use App\Http\Interfaces\UserServiceInterface;
use App\Models\User;
use App\Support\Concerns\BaseService;

class UserService extends BaseService implements UserServiceInterface
{
    public function __construct(User $user, array $relations = [])
    {
        parent::__construct(
            model: $user,
            relations: $relations,
        );
    }

    public function delete(int $id): ?array
    {
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($id): void {
                $record = $this->model->newQuery()->findOrFail($id);

                // Set user_id of employee to null
                \App\Models\Employee::query()->where('user_id', $id)->update([
                    'user_id' => null,
                ]);

                // Hard delete the user
                $record->delete();
            });

            return null;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error deleting user in UserService (ID: {$id}): " . $e->getMessage());
            throw $e;
        }
    }
}
